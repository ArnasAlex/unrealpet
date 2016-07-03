var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var entity = require('../../entities/accountEntity');
var GetAccountSettingsOperation = (function (_super) {
    __extends(GetAccountSettingsOperation, _super);
    function GetAccountSettingsOperation() {
        _super.apply(this, arguments);
    }
    GetAccountSettingsOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.getAccount.bind(this)
        ], this.respond.bind(this, cb));
    };
    GetAccountSettingsOperation.prototype.getAccount = function (next) {
        var id = this.getObjectId(this.request.accountId);
        this.mustFindOne(entity.CollectionName, { _id: id }, function (err, res) {
            next(err, res);
        });
    };
    GetAccountSettingsOperation.prototype.mapEntityToResponse = function (account) {
        var settings = account.settings || {};
        var response = {
            language: settings.language,
            email: account.email
        };
        return response;
    };
    GetAccountSettingsOperation.prototype.respond = function (cb, err, account) {
        var response = err ? { error: err } : this.mapEntityToResponse(account);
        cb(response);
    };
    return GetAccountSettingsOperation;
})(operation.Operation);
exports.GetAccountSettingsOperation = GetAccountSettingsOperation;
//# sourceMappingURL=getAccountSettingsOperation.js.map