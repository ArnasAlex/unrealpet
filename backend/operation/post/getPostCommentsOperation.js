var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var postEntity = require('../../entities/postEntity');
var activityEntity = require('../../entities/activityEntity');
var accountEntity = require('../../entities/accountEntity');
var GetPostCommentsOperation = (function (_super) {
    __extends(GetPostCommentsOperation, _super);
    function GetPostCommentsOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.getPost = function (next) {
            var postId = _this.getObjectId(_this.request.postId);
            _this.findOne(postEntity.CollectionName, { _id: postId }, function (err, res) {
                _this.post = res;
                next(err);
            });
        };
        this.updateOwnerViewedOn = function (next) {
            if (_this.currentUserId() === _this.post.ownerId.toString()) {
                var query = { _id: _this.post._id };
                var update = { $set: { ownerViewedOn: new Date() } };
                _this.db.collection(postEntity.CollectionName).update(query, update, function (err, res) {
                    if (err) {
                        _this.logDbError('Error on updating ownerViewedOn: ' + err);
                    }
                });
            }
            next(null);
        };
        this.clearRecentActivities = function (next) {
            var query = {
                accountId: _this.currentUserObjectId(),
                relatedId: _this.post._id
            };
            _this.remove(activityEntity.CollectionName, query, function () { });
            next(null);
        };
        this.getComments = function (next) {
            var comments = _this.post.comments;
            _this.totalCount = 0;
            if (comments && comments.length > 0) {
                comments = _this.getCommentsAccordingToRequest(comments);
                _this.totalCount = comments.length;
                comments = _this.sortComments(comments);
                comments = _this.getPageOfComments(comments);
            }
            if (!comments) {
                comments = [];
            }
            _this.comments = comments;
            _this.allComments = _this.post.comments;
            next(null);
        };
        this.getRelatedAccounts = function (next) {
            var ownerIds = _this.getOwnerIds(_this.comments);
            _this.db.collection(accountEntity.CollectionName).find({ _id: { $in: ownerIds } }).toArray(function (err, res) {
                if (err) {
                    _this.logDbError('Error on find. Collection: ' + accountEntity.CollectionName + ', error: ' + err + '');
                    err = _this.defaultErrorMsg();
                    next(err);
                }
                else {
                    _this.accounts = res;
                    next(err);
                }
            });
        };
        this.map = function (next) {
            var result = [];
            if (_this.comments.length > 0) {
                for (var i = 0; i < _this.comments.length; i++) {
                    var entity = _this.comments[i];
                    var comment = {
                        id: entity._id.toString(),
                        text: entity.text,
                        ownerId: entity.ownerId.toString(),
                        ownerName: null,
                        ownerLogo: null,
                        ownerType: null,
                        date: entity.updatedOn,
                        isPawed: _this.getIsPawed(entity),
                        paws: _this.getPawCount(entity),
                        parentCommentId: entity.parentCommentId ? entity.parentCommentId.toString() : null,
                        replies: _this.getReplyCount(entity._id.toString(), _this.allComments)
                    };
                    _this.mapOwnerInfo(comment, _this.accounts);
                    result.push(comment);
                }
            }
            next(null, result);
        };
    }
    GetPostCommentsOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.getPost,
            this.updateOwnerViewedOn,
            this.clearRecentActivities,
            this.getComments,
            this.getRelatedAccounts,
            this.map
        ], this.respond.bind(this, cb));
    };
    GetPostCommentsOperation.prototype.getPageOfComments = function (comments) {
        var skip = this.getNumberFromGetRequest(this.request.skip);
        var pageSize = GetPostCommentsOperation.pageSize;
        var result = comments.slice(skip, skip + pageSize);
        return result;
    };
    GetPostCommentsOperation.prototype.getCommentsAccordingToRequest = function (comments) {
        var result;
        if (!this.request.commentId) {
            result = this.removeReplies(comments);
        }
        else {
            result = this.getReplies(comments, this.request.commentId);
        }
        return result;
    };
    GetPostCommentsOperation.prototype.getReplies = function (comments, parentCommentId) {
        var repliesForComment = this._.filter(comments, function (x) {
            return x.parentCommentId &&
                x.parentCommentId.toString() === parentCommentId;
        });
        return repliesForComment;
    };
    GetPostCommentsOperation.prototype.removeReplies = function (comments) {
        var comments = this._.filter(comments, function (x) { return !x.parentCommentId; });
        return comments;
    };
    GetPostCommentsOperation.prototype.sortComments = function (comments) {
        var _this = this;
        return comments.sort(function (a, b) {
            var result = 0;
            if (_this.anyCommentsHasPaws(a, b)) {
                result = _this.compareCommentsByHasPaws(a, b);
                if (result === 0) {
                    result = _this.compareCommentsByPaws(a, b);
                }
            }
            if (result === 0) {
                result = _this.compareCommentsByDate(a, b);
            }
            return result;
        });
    };
    GetPostCommentsOperation.prototype.compareCommentsByDate = function (a, b) {
        var aDate = a.createdOn.getTime();
        var bDate = b.createdOn.getTime();
        return aDate < bDate
            ? -1
            : aDate > bDate
                ? 1
                : 0;
    };
    GetPostCommentsOperation.prototype.anyCommentsHasPaws = function (a, b) {
        return this.hasPaws(a) || this.hasPaws(b);
    };
    GetPostCommentsOperation.prototype.compareCommentsByHasPaws = function (a, b) {
        var result = 0;
        if (this.hasPaws(a) && !this.hasPaws(b)) {
            result = -1;
        }
        else if (!this.hasPaws(a) && this.hasPaws(b)) {
            result = 1;
        }
        return result;
    };
    GetPostCommentsOperation.prototype.compareCommentsByPaws = function (a, b) {
        return a.paws.length > b.paws.length
            ? -1
            : a.paws.length < b.paws.length
                ? 1
                : 0;
    };
    GetPostCommentsOperation.prototype.hasPaws = function (comment) {
        return comment.paws && comment.paws.length > 0;
    };
    GetPostCommentsOperation.prototype.getOwnerIds = function (comments) {
        var ownerIds = [];
        for (var i = 0; i < comments.length; i++) {
            var ownerId = comments[i].ownerId;
            if (ownerIds.indexOf(ownerId) === -1) {
                ownerIds.push(comments[i].ownerId);
            }
        }
        return ownerIds;
    };
    GetPostCommentsOperation.prototype.getReplyCount = function (commentId, allComments) {
        var replies = this._.filter(allComments, function (x) { return x.parentCommentId && x.parentCommentId.toString() === commentId; });
        return replies.length;
    };
    GetPostCommentsOperation.prototype.getPawCount = function (comment) {
        return comment.paws ? comment.paws.length : 0;
    };
    GetPostCommentsOperation.prototype.getIsPawed = function (comment) {
        var _this = this;
        var result = false;
        if (this.currentUserId() && this.getPawCount(comment) > 0) {
            result = this._.any(comment.paws, function (paw) { return paw.ownerId.toString() === _this.currentUserId(); });
        }
        return result;
    };
    GetPostCommentsOperation.prototype.mapOwnerInfo = function (comment, owners) {
        var ownerId = this.getObjectId(comment.ownerId);
        var owner = this._.filter(owners, function (owner) { return owner._id.equals(ownerId); })[0];
        comment.ownerName = owner.name;
        comment.ownerLogo = owner.logo;
        comment.ownerType = owner.type;
    };
    GetPostCommentsOperation.prototype.respond = function (cb, err, comments) {
        var response = { error: err, comments: comments, totalCount: this.totalCount };
        cb(response);
    };
    GetPostCommentsOperation.pageSize = 10;
    return GetPostCommentsOperation;
})(operation.Operation);
exports.GetPostCommentsOperation = GetPostCommentsOperation;
//# sourceMappingURL=getPostCommentsOperation.js.map