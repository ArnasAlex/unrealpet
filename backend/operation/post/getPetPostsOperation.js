var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var searchOp = require('./searchPostsOperation');
var GetPetPostsOperation = (function (_super) {
    __extends(GetPetPostsOperation, _super);
    function GetPetPostsOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.getQuery = function (next) {
            var ownerId = _this.getOwnerId(_this.request);
            var ownerOId = ownerId ? _this.getObjectId(ownerId) : null;
            if (!ownerOId) {
                next(2);
                return;
            }
            var query = { ownerId: ownerOId };
            next(null, query);
        };
        this.executeGetPosts = function (query, next) {
            var req = {
                query: query,
                skip: _this.request.skip,
                take: _this.request.take,
                accountId: _this.request.accountId
            };
            _this.executeSearchOperation(req, next);
        };
    }
    GetPetPostsOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.getQuery,
            this.executeGetPosts
        ], this.respond.bind(this, cb));
    };
    GetPetPostsOperation.prototype.executeSearchOperation = function (req, next) {
        new searchOp.SearchPostsOperation(req).execute(function (res) {
            next(null, res);
        });
    };
    GetPetPostsOperation.prototype.getOwnerId = function (req) {
        var result = req.id ? req.id : req.accountId;
        return result;
    };
    GetPetPostsOperation.prototype.respond = function (cb, err, searchResponse) {
        var err = err ? err : searchResponse.error;
        var response = {
            error: err,
            list: searchResponse ? searchResponse.list : null
        };
        cb(response);
    };
    return GetPetPostsOperation;
})(operation.Operation);
exports.GetPetPostsOperation = GetPetPostsOperation;
//# sourceMappingURL=getPetPostsOperation.js.map