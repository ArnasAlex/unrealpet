var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var postEntity = require('../../entities/postEntity');
var accountEntity = require('../../entities/accountEntity');
var SearchPostsOperation = (function (_super) {
    __extends(SearchPostsOperation, _super);
    function SearchPostsOperation() {
        _super.apply(this, arguments);
        this.monthInMs = 1000 * 60 * 60 * 24 * 30;
    }
    SearchPostsOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.getPosts.bind(this),
            this.getRelatedAccounts.bind(this),
            this.map.bind(this)
        ], this.respond.bind(this, cb));
    };
    SearchPostsOperation.prototype.getPosts = function (next) {
        var _this = this;
        this.parseSearchRequest(this.request);
        var query = this.request.query;
        this.db.collection(postEntity.CollectionName)
            .find(query)
            .sort({ createdOn: -1 })
            .skip(this.request.skip)
            .limit(this.request.take)
            .toArray(function (err, res) {
            if (err) {
                _this.logDbError('Error on find. Collection: ' + postEntity.CollectionName + ', error: ' + err + '');
                err = _this.defaultErrorMsg();
                next(err);
            }
            else {
                next(err, res);
            }
        });
    };
    SearchPostsOperation.prototype.getRelatedAccounts = function (posts, next) {
        var _this = this;
        var ownerIds = this.getOwnerIds(posts);
        var topCommentOwnerIds = this.getTopCommentsOwnerIds(posts);
        var accountIds = ownerIds.concat(topCommentOwnerIds);
        var uniqueAccountIds = this._.unique(accountIds);
        this.db.collection(accountEntity.CollectionName).find({ _id: { $in: uniqueAccountIds } }).toArray(function (err, res) {
            if (err) {
                _this.logDbError('Error on find. Collection: ' + accountEntity.CollectionName + ', error: ' + err + '');
                err = _this.defaultErrorMsg();
                next(err);
            }
            else {
                next(err, posts, res);
            }
        });
    };
    SearchPostsOperation.prototype.getTopCommentsOwnerIds = function (posts) {
        var ownerIds = [];
        for (var i = 0; i < posts.length; i++) {
            var topComment = this.getTopComment(posts[i]);
            if (topComment) {
                var ownerId = topComment.ownerId;
                if (ownerIds.indexOf(ownerId) === -1) {
                    ownerIds.push(ownerId);
                }
            }
        }
        return ownerIds;
    };
    SearchPostsOperation.prototype.getTopComment = function (post) {
        var comments = post.comments;
        var topComment = null;
        if (comments && comments.length > 0) {
            for (var i = 0; i < comments.length; i++) {
                if (!topComment ||
                    (!topComment.paws && comments[i].paws) ||
                    (comments[i].paws && topComment.paws && topComment.paws.length < comments[i].paws.length)) {
                    topComment = comments[i];
                }
            }
        }
        return topComment;
    };
    SearchPostsOperation.prototype.getOwnerIds = function (posts) {
        var ownerIds = [];
        for (var i = 0; i < posts.length; i++) {
            var ownerId = posts[i].ownerId;
            if (ownerIds.indexOf(ownerId) === -1) {
                ownerIds.push(posts[i].ownerId);
            }
        }
        return ownerIds;
    };
    SearchPostsOperation.prototype.map = function (posts, owners, next) {
        var result = [];
        for (var i = 0; i < posts.length; i++) {
            var post = {
                id: posts[i]._id.toString(),
                title: posts[i].title,
                contentUrl: posts[i].pictureUrl,
                ownerId: posts[i].ownerId.toString(),
                ownerName: null,
                ownerLogo: null,
                ownerType: null,
                paws: this.getPawCount(posts[i]),
                isPawed: this.getIsPawed(posts[i]),
                comments: this.getCommentCount(posts[i]),
                topComment: null,
                topCommentOwnerName: null,
                favs: posts[i].favs,
                contentType: posts[i].pictureType,
                createdOn: posts[i].createdOn,
                unreadComments: this.getUnreadComments(posts[i]),
                unviewedPaws: this.getUnviewedPaws(posts[i])
            };
            this.mapOwnerInfo(post, owners);
            this.mapTopComment(post, posts[i], owners);
            result.push(post);
        }
        next(null, result);
    };
    SearchPostsOperation.prototype.getUnreadComments = function (post) {
        if (!this.request.accountId || this.request.accountId !== post.ownerId.toString()
            || !post.comments || post.comments.length === 0) {
            return 0;
        }
        if (post.updatedOn.getTime() < new Date().getTime() - this.monthInMs) {
            return 0;
        }
        var unreadComments = this._.filter(post.comments, function (comment) {
            return comment.ownerId.toString() !== post.ownerId.toString() &&
                (!post.ownerViewedOn || comment.createdOn.getTime() > post.ownerViewedOn.getTime());
        });
        return unreadComments.length;
    };
    SearchPostsOperation.prototype.getUnviewedPaws = function (post) {
        if (!this.request.accountId || this.request.accountId !== post.ownerId.toString()
            || !post.paws || post.paws.length === 0) {
            return 0;
        }
        if (post.updatedOn.getTime() < new Date().getTime() - this.monthInMs) {
            return 0;
        }
        var unviewedPaws = this._.filter(post.paws, function (paw) {
            return paw.ownerId.toString() !== post.ownerId.toString()
                && (!post.ownerViewedOn || paw.createdOn.getTime() > post.ownerViewedOn.getTime());
        });
        return unviewedPaws.length;
    };
    SearchPostsOperation.prototype.getCommentCount = function (post) {
        return post.comments ? post.comments.length : 0;
    };
    SearchPostsOperation.prototype.getPawCount = function (post) {
        return post.paws ? post.paws.length : 0;
    };
    SearchPostsOperation.prototype.getIsPawed = function (post) {
        var _this = this;
        var result = false;
        if (this.request.accountId && post.paws && post.paws.length > 0) {
            result = this._.any(post.paws, function (paw) { return paw.ownerId.toString() === _this.request.accountId; });
        }
        return result;
    };
    SearchPostsOperation.prototype.mapOwnerInfo = function (post, owners) {
        var ownerId = this.getObjectId(post.ownerId);
        var owner = this._.filter(owners, function (owner) { return owner._id.equals(ownerId); })[0];
        post.ownerName = owner.name;
        post.ownerLogo = owner.logo;
        post.ownerType = owner.type;
    };
    SearchPostsOperation.prototype.mapTopComment = function (post, entity, owners) {
        var topComment = this.getTopComment(entity);
        if (topComment) {
            var ownerId = topComment.ownerId;
            var owner = this._.filter(owners, function (owner) { return owner._id.equals(ownerId); })[0];
            post.topComment = topComment.text;
            post.topCommentOwnerName = owner.name;
        }
    };
    SearchPostsOperation.prototype.respond = function (cb, err, posts) {
        var response = { error: err, list: posts };
        cb(response);
    };
    return SearchPostsOperation;
})(operation.Operation);
exports.SearchPostsOperation = SearchPostsOperation;
//# sourceMappingURL=searchPostsOperation.js.map