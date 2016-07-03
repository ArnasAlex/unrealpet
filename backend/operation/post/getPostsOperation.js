var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var searchOp = require('./searchPostsOperation');
var GetPostsOperation = (function (_super) {
    __extends(GetPostsOperation, _super);
    function GetPostsOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.executeGetPosts = function (next) {
            var allPostsQuery = {};
            var req = {
                query: allPostsQuery,
                skip: _this.request.skip,
                take: _this.request.take,
                accountId: _this.request.accountId
            };
            _this.executeSearchOperation(req, next);
        };
    }
    GetPostsOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.executeGetPosts
        ], this.respond.bind(this, cb));
    };
    GetPostsOperation.prototype.executeSearchOperation = function (req, next) {
        new searchOp.SearchPostsOperation(req).execute(function (res) {
            next(null, res);
        });
    };
    GetPostsOperation.prototype.respond = function (cb, err, searchResponse) {
        var err = err ? err : searchResponse.error;
        var response = {
            error: err,
            list: searchResponse ? searchResponse.list : null
        };
        cb(response);
    };
    return GetPostsOperation;
})(operation.Operation);
exports.GetPostsOperation = GetPostsOperation;
//# sourceMappingURL=getPostsOperation.js.map