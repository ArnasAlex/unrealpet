var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var postEntity = require('../../entities/postEntity');
var EditPostOperation = (function (_super) {
    __extends(EditPostOperation, _super);
    function EditPostOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.getPost = function (next) {
            _this.mustFindOne(postEntity.CollectionName, { _id: _this.getObjectId(_this.request.id) }, next);
        };
        this.checkPermissions = function (post, next) {
            if (_this.currentUserId() === post.ownerId.toString() || _this.isAdmin()) {
                next(null, post);
            }
            else {
                _this.logError('User trying to edit post without permissions. UserId: ' + _this.currentUserId()
                    + ", PostId: " + post._id.toString());
                next(_this.defaultErrorMsg());
            }
        };
        this.editPost = function (post, next) {
            if (_this.request.isRemoval) {
                _this.removePost(post, next);
            }
            else {
                _this.editPostInfo(post, next);
            }
        };
        this.removePost = function (post, next) {
            _this.save(postEntity.DeletedCollectionName, post, function (err, res) {
                if (!err) {
                    _this.delete(postEntity.CollectionName, { _id: post._id }, next);
                }
                else {
                    next(err);
                }
            });
        };
        this.editPostInfo = function (post, next) {
            post.title = _this.request.title;
            _this.save(postEntity.CollectionName, post, next);
        };
    }
    EditPostOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.getPost,
            this.checkPermissions,
            this.editPost
        ], this.respond.bind(this, cb));
    };
    EditPostOperation.prototype.respond = function (cb, err) {
        var response = { error: err };
        cb(response);
    };
    return EditPostOperation;
})(operation.Operation);
exports.EditPostOperation = EditPostOperation;
//# sourceMappingURL=editPostOperation.js.map