var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var searchOp = require('./searchPostsOperation');
var GetPostOperation = (function (_super) {
    __extends(GetPostOperation, _super);
    function GetPostOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.executeGetPost = function (next) {
            var query = { _id: _this.getObjectId(_this.request.id) };
            var req = {
                query: query,
                skip: 0,
                take: 1,
                accountId: _this.request.accountId
            };
            _this.executeSearchOperation(req, next);
        };
        this.fillEditAccess = function (searchResponse, next) {
            var post = searchResponse.list[0];
            if (!post) {
                next(2);
                return;
            }
            var userId = _this.currentUserId();
            if (userId && (userId === post.ownerId || _this.isAdmin())) {
                post.canEdit = true;
            }
            next(searchResponse.error, post);
        };
    }
    GetPostOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.executeGetPost,
            this.fillEditAccess
        ], this.respond.bind(this, cb));
    };
    GetPostOperation.prototype.executeSearchOperation = function (req, next) {
        new searchOp.SearchPostsOperation(req).execute(function (res) {
            next(null, res);
        });
    };
    GetPostOperation.prototype.respond = function (cb, err, post) {
        var response = {
            error: err,
            post: post
        };
        cb(response);
    };
    return GetPostOperation;
})(operation.Operation);
exports.GetPostOperation = GetPostOperation;
//# sourceMappingURL=getPostOperation.js.map