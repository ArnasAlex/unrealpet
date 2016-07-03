var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var accountEntity = require('../../entities/accountEntity');
var SaveAccountOperation = (function (_super) {
    __extends(SaveAccountOperation, _super);
    function SaveAccountOperation() {
        _super.apply(this, arguments);
    }
    SaveAccountOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.validate.bind(this),
            this.getAccount.bind(this),
            this.saveAccount.bind(this)
        ], this.respond.bind(this, cb));
    };
    SaveAccountOperation.prototype.validate = function (next) {
        var error;
        if (!this.request.name) {
            error = 'Name is required';
        }
        next(error);
    };
    SaveAccountOperation.prototype.getAccount = function (next) {
        var id = this.getObjectId(this.request.accountId);
        this.mustFindOne(accountEntity.CollectionName, { _id: id }, function (err, res) {
            next(err, res);
        });
    };
    SaveAccountOperation.prototype.saveAccount = function (account, next) {
        this.mapRequestToEntity(account);
        this.save(accountEntity.CollectionName, account, next);
    };
    SaveAccountOperation.prototype.mapRequestToEntity = function (account) {
        account.name = this.request.name;
        account.type = this.request.type;
        account.breed = this.request.breed;
        account.birthday = this.request.birthday ? new Date(this.request.birthday) : null;
        account.about = this.request.about;
    };
    SaveAccountOperation.prototype.respond = function (cb, err) {
        var response = { error: err };
        cb(response);
    };
    return SaveAccountOperation;
})(operation.Operation);
exports.SaveAccountOperation = SaveAccountOperation;
//# sourceMappingURL=saveAccountOperation.js.map