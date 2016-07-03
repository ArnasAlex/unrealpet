var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var postEntity = require('../../entities/postEntity');
var commentEntity = require('../../entities/commentEntity');
var accountEntity = require('../../entities/accountEntity');
var activityEntity = require('../../entities/activityEntity');
var SavePostCommentOperation = (function (_super) {
    __extends(SavePostCommentOperation, _super);
    function SavePostCommentOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.getPost = function (next) {
            _this.findOne(postEntity.CollectionName, { _id: _this.getObjectId(_this.request.postId) }, function (err, res) {
                _this.post = res;
                next(err);
            });
        };
        this.addComment = function (next) {
            if (!_this.post.comments) {
                _this.post.comments = [];
            }
            var comment = _this.createCommentFromRequest();
            _this.post.comments.push(comment);
            _this.post.favs++;
            _this.newComment = comment;
            next(null);
        };
        this.updateOwnerViewedOn = function (next) {
            if (_this.request.accountId === _this.post.ownerId.toString()) {
                var nowPlusMs = new Date();
                nowPlusMs.setTime(new Date().getTime() + 1);
                _this.post.ownerViewedOn = nowPlusMs;
            }
            next(null);
        };
        this.addActivities = function (next) {
            var activities = [];
            var accountIds = _this.getPostSubscribers();
            if (accountIds.length > 0) {
                _this._.each(accountIds, function (accountId) {
                    var activity = new activityEntity.ActivityEntity();
                    activity.createdOn = new Date();
                    activity.message = _this.request.text;
                    activity.relatedId = _this.post._id;
                    activity.type = 1;
                    activity.title = _this.post.title;
                    activity.accountId = accountId;
                    activities.push(activity);
                });
            }
            if (_this.post.ownerId.toString() !== _this.currentUserId()) {
                var activity = new activityEntity.ActivityEntity();
                activity.createdOn = new Date();
                activity.message = _this.request.text;
                activity.relatedId = _this.post._id;
                activity.type = 0;
                activity.title = _this.post.title;
                activity.accountId = _this.post.ownerId;
                activities.push(activity);
            }
            if (activities.length > 0) {
                _this.db.collection(activityEntity.CollectionName).insert(activities, function (err) {
                    if (err) {
                        _this.logDbError(err.toString(), activityEntity.CollectionName);
                    }
                });
            }
            next();
        };
        this.getPostSubscribers = function () {
            var accountIds = [];
            _this._.each(_this.post.comments, function (comment) {
                if (_this.newComment._id.toString() === comment._id.toString()) {
                    return;
                }
                if (comment.ownerId.toString() === _this.currentUserId()) {
                    return;
                }
                if (comment.ownerId.toString() === _this.post.ownerId.toString()) {
                    return;
                }
                if (_this._.some(accountIds, function (x) { return x.toString() === comment.ownerId.toString(); })) {
                    return;
                }
                accountIds.push(comment.ownerId);
            });
            return accountIds;
        };
        this.savePost = function (next) {
            _this.save(postEntity.CollectionName, _this.post, function (err, res) {
                next(err);
            });
        };
        this.createResponse = function (next) {
            _this.findOne(accountEntity.CollectionName, { _id: _this.newComment.ownerId }, function (err, res) {
                var mappedComment;
                if (!err) {
                    mappedComment = _this.mapComment(_this.newComment);
                    mappedComment.ownerLogo = res.logo;
                    mappedComment.ownerName = res.name;
                    mappedComment.ownerType = res.type;
                }
                next(err, mappedComment);
            });
        };
    }
    SavePostCommentOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.getPost,
            this.addComment,
            this.updateOwnerViewedOn,
            this.addActivities,
            this.savePost,
            this.createResponse
        ], this.respond.bind(this, cb));
    };
    SavePostCommentOperation.prototype.createCommentFromRequest = function () {
        var accountId = this.getObjectId(this.request.accountId);
        var comment = new commentEntity.CommentEntity();
        comment.text = this.request.text;
        comment.ownerId = accountId;
        comment._id = this.getId();
        comment.createdOn = new Date();
        comment.updatedOn = new Date();
        var paw = new postEntity.PawEntity();
        paw.ownerId = accountId;
        paw.createdOn = new Date();
        comment.paws = [paw];
        if (this.request.parentCommentId) {
            comment.parentCommentId = this.getObjectId(this.request.parentCommentId);
        }
        return comment;
    };
    SavePostCommentOperation.prototype.mapComment = function (comment) {
        var mappedComment = {
            id: comment._id.toString(),
            text: comment.text,
            ownerId: comment.ownerId.toString(),
            ownerName: null,
            ownerLogo: null,
            ownerType: null,
            date: comment.updatedOn,
            isPawed: true,
            paws: 1,
            parentCommentId: comment.parentCommentId ? comment.parentCommentId.toString() : null,
            replies: 0
        };
        return mappedComment;
    };
    SavePostCommentOperation.prototype.respond = function (cb, err, comment) {
        var response = {
            error: err,
            comment: comment
        };
        cb(response);
    };
    return SavePostCommentOperation;
})(operation.Operation);
exports.SavePostCommentOperation = SavePostCommentOperation;
//# sourceMappingURL=savePostCommentOperation.js.map