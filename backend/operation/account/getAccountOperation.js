var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var entity = require('../../entities/accountEntity');
var GetAccountOperation = (function (_super) {
    __extends(GetAccountOperation, _super);
    function GetAccountOperation() {
        _super.apply(this, arguments);
    }
    GetAccountOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.getAccount.bind(this)
        ], this.respond.bind(this, cb));
    };
    GetAccountOperation.prototype.getAccount = function (next) {
        var id = this.getObjectId(this.request.accountId);
        this.mustFindOne(entity.CollectionName, { _id: id }, function (err, res) {
            next(err, res);
        });
    };
    GetAccountOperation.prototype.mapEntityToResponse = function (account) {
        var birthday = account.birthday
            ? account.birthday.toISOString().slice(0, 10)
            : null;
        var response = {
            name: account.name,
            type: account.type,
            breed: account.breed,
            birthday: birthday,
            about: account.about,
            picture: account.picture,
            logo: account.logo
        };
        return response;
    };
    GetAccountOperation.prototype.respond = function (cb, err, account) {
        var response = err ? { error: err } : this.mapEntityToResponse(account);
        cb(response);
    };
    return GetAccountOperation;
})(operation.Operation);
exports.GetAccountOperation = GetAccountOperation;
//# sourceMappingURL=getAccountOperation.js.map