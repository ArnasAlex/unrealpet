var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var accountEntity = require('../../entities/accountEntity');
var hash = require('node_hash');
var accountHelper = require('./accountHelper');
var SignUpLocalOperation = (function (_super) {
    __extends(SignUpLocalOperation, _super);
    function SignUpLocalOperation() {
        _super.apply(this, arguments);
    }
    SignUpLocalOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.checkEmail.bind(this),
            this.saveAccount.bind(this)
        ], this.respond.bind(this, cb));
    };
    SignUpLocalOperation.prototype.checkEmail = function (next) {
        var _this = this;
        var email = this.request.email.toLowerCase();
        this.db.collection(accountEntity.CollectionName).findOne({ email: email }, function (err, res) {
            if (!err) {
                if (res) {
                    err = _this.mlt.login_email_exists;
                }
            }
            else {
                _this.logDbError(err);
                err = _this.defaultErrorMsg();
            }
            next(err);
        });
    };
    SignUpLocalOperation.prototype.saveAccount = function (next) {
        var acc = this.mapRequestToEntity();
        accountHelper.Helper.setDefaultValuesForNewAccount(acc);
        accountHelper.Helper.setLanguageForNewAccount(acc, this.request.req);
        this.save(accountEntity.CollectionName, acc, next);
    };
    SignUpLocalOperation.prototype.hash = function (password, email) {
        return hash.sha256(password, email);
    };
    SignUpLocalOperation.prototype.mapRequestToEntity = function () {
        var account = new accountEntity.AccountEntity();
        account.email = this.request.email.toLowerCase();
        account.password = this.hash(this.request.password, account.email);
        return account;
    };
    SignUpLocalOperation.prototype.respond = function (cb, err) {
        var response = { error: err };
        cb(response);
    };
    return SignUpLocalOperation;
})(operation.Operation);
exports.SignUpLocalOperation = SignUpLocalOperation;
//# sourceMappingURL=signUpLocalOperation.js.map