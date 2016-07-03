var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var accountEntity = require('../../entities/accountEntity');
var accHelper = require('./accountHelper');
var GetAccountByProviderOperation = (function (_super) {
    __extends(GetAccountByProviderOperation, _super);
    function GetAccountByProviderOperation() {
        _super.apply(this, arguments);
    }
    GetAccountByProviderOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.getUser.bind(this)
        ], this.respond.bind(this, cb));
    };
    GetAccountByProviderOperation.prototype.getUser = function (next) {
        var provider = accHelper.Helper.getProviderName(this.request.provider);
        var query = {};
        query[provider] = { id: this.request.id };
        this.findOne(accountEntity.CollectionName, query, function (err, res) {
            var account = res
                ? accHelper.Helper.map(res)
                : null;
            next(err, account);
        });
    };
    GetAccountByProviderOperation.prototype.respond = function (cb, err, account) {
        var response = {
            error: err,
            account: account,
            exists: account !== null
        };
        cb(response);
    };
    return GetAccountByProviderOperation;
})(operation.Operation);
exports.GetAccountByProviderOperation = GetAccountByProviderOperation;
//# sourceMappingURL=getAccountByProviderOperation.js.map