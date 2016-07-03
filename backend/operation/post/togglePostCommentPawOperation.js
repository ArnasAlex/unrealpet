var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var postEntity = require('../../entities/postEntity');
var TogglePostCommentPawOperation = (function (_super) {
    __extends(TogglePostCommentPawOperation, _super);
    function TogglePostCommentPawOperation() {
        _super.apply(this, arguments);
    }
    TogglePostCommentPawOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.getPost.bind(this),
            this.togglePaw.bind(this),
            this.savePost.bind(this)
        ], this.respond.bind(this, cb));
    };
    TogglePostCommentPawOperation.prototype.getPost = function (next) {
        this.findOne(postEntity.CollectionName, { _id: this.getObjectId(this.request.postId) }, function (err, res) {
            next(err, res);
        });
    };
    TogglePostCommentPawOperation.prototype.togglePaw = function (post, next) {
        var comment = this.getComment(post, this.request.commentId);
        var accountId = this.getObjectId(this.request.accountId);
        var isPawSet = false;
        var paw = new postEntity.PawEntity();
        paw.ownerId = accountId;
        paw.createdOn = new Date();
        if (!comment.paws || comment.paws.length === 0) {
            comment.paws = [paw];
            isPawSet = true;
        }
        else {
            var index = this._.findIndex(comment.paws, function (paw) {
                return paw.ownerId.equals(accountId);
            });
            if (index === -1) {
                comment.paws.push(paw);
                isPawSet = true;
            }
            else {
                comment.paws.splice(index, 1);
            }
        }
        this.updatePostFavs(post, isPawSet);
        next(null, post, isPawSet);
    };
    TogglePostCommentPawOperation.prototype.updatePostFavs = function (post, isPawSet) {
        var favDiff = isPawSet ? 1 : -1;
        post.favs += favDiff;
    };
    TogglePostCommentPawOperation.prototype.getComment = function (post, commentId) {
        var id = this.getObjectId(commentId);
        return this._.find(post.comments, function (x) { return x._id.equals(id); });
    };
    TogglePostCommentPawOperation.prototype.savePost = function (post, isPawSet, next) {
        this.save(postEntity.CollectionName, post, function (err, res) {
            next(err, isPawSet);
        });
    };
    TogglePostCommentPawOperation.prototype.respond = function (cb, err, isPawSet) {
        var response = {
            error: err,
            isPawSet: isPawSet
        };
        cb(response);
    };
    return TogglePostCommentPawOperation;
})(operation.Operation);
exports.TogglePostCommentPawOperation = TogglePostCommentPawOperation;
//# sourceMappingURL=togglePostCommentPawOperation.js.map