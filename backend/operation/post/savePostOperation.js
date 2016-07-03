var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var postEntity = require('../../entities/postEntity');
var SavePostOperation = (function (_super) {
    __extends(SavePostOperation, _super);
    function SavePostOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.savePost = function (next) {
            var post = _this.mapRequestToEntity(_this.request);
            _this.save(postEntity.CollectionName, post, next);
        };
    }
    SavePostOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.savePost
        ], this.respond.bind(this, cb));
    };
    SavePostOperation.prototype.mapRequestToEntity = function (request) {
        var accountId = this.getObjectId(request.accountId);
        var post = new postEntity.PostEntity();
        post.title = request.title;
        post.pictureUrl = request.contentUrl;
        post.ownerId = accountId;
        post.pictureType = request.contentType;
        post.favs = 1;
        var paw = new postEntity.PawEntity();
        paw.ownerId = accountId;
        paw.createdOn = new Date();
        post.paws = [paw];
        return post;
    };
    SavePostOperation.prototype.respond = function (cb, err) {
        var response = { error: err };
        cb(response);
    };
    return SavePostOperation;
})(operation.Operation);
exports.SavePostOperation = SavePostOperation;
//# sourceMappingURL=savePostOperation.js.map