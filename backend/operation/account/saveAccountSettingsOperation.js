var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var accountEntity = require('../../entities/accountEntity');
var SaveAccountSettingsOperation = (function (_super) {
    __extends(SaveAccountSettingsOperation, _super);
    function SaveAccountSettingsOperation() {
        _super.apply(this, arguments);
    }
    SaveAccountSettingsOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.getAccount.bind(this),
            this.saveAccount.bind(this)
        ], this.respond.bind(this, cb));
    };
    SaveAccountSettingsOperation.prototype.getAccount = function (next) {
        var id = this.getObjectId(this.request.accountId);
        this.mustFindOne(accountEntity.CollectionName, { _id: id }, function (err, res) {
            next(err, res);
        });
    };
    SaveAccountSettingsOperation.prototype.saveAccount = function (account, next) {
        this.mapRequestToEntity(account);
        this.save(accountEntity.CollectionName, account, next);
    };
    SaveAccountSettingsOperation.prototype.mapRequestToEntity = function (account) {
        if (!account.settings) {
            account.settings = { language: 0 };
        }
        account.settings.language = this.request.language;
    };
    SaveAccountSettingsOperation.prototype.respond = function (cb, err) {
        var response = { error: err };
        cb(response);
    };
    return SaveAccountSettingsOperation;
})(operation.Operation);
exports.SaveAccountSettingsOperation = SaveAccountSettingsOperation;
//# sourceMappingURL=saveAccountSettingsOperation.js.map