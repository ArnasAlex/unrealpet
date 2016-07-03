var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var accountEntity = require('../../entities/accountEntity');
var accountHelper = require('./accountHelper');
var SignUpByProviderOperation = (function (_super) {
    __extends(SignUpByProviderOperation, _super);
    function SignUpByProviderOperation() {
        _super.apply(this, arguments);
    }
    SignUpByProviderOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.checkEmail.bind(this),
            this.saveAccount.bind(this),
            this.map.bind(this)
        ], this.respond.bind(this, cb));
    };
    SignUpByProviderOperation.prototype.checkEmail = function (next) {
        var _this = this;
        var emails = this.request.profile.emails;
        if (!emails || emails.length === 0) {
            next(null);
            return;
        }
        var email = this.request.profile.emails[0].value.toLowerCase();
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
    SignUpByProviderOperation.prototype.saveAccount = function (next) {
        var acc = this.mapRequestToEntity();
        accountHelper.Helper.setDefaultValuesForNewAccount(acc);
        accountHelper.Helper.setLanguageForNewAccount(acc, this.request.req);
        this.save(accountEntity.CollectionName, acc, next);
    };
    SignUpByProviderOperation.prototype.mapRequestToEntity = function () {
        var acc = new accountEntity.AccountEntity();
        var emails = this.request.profile.emails;
        acc.email = emails && emails.length > 0 ? emails[0].value : null;
        acc.master = {
            name: this.request.profile.displayName
        };
        var providerName = accountHelper.Helper.getProviderName(this.request.provider);
        acc[providerName] = {};
        var providerInfo = acc[providerName];
        providerInfo.id = this.request.profile.id;
        return acc;
    };
    SignUpByProviderOperation.prototype.logIncorrectProfileError = function () {
        var msg = 'Signing up with provider but email is not provided. Provider: '
            + this.request.provider
            + ', Profile: '
            + JSON.stringify(this.request.profile);
        this.logError(msg);
    };
    SignUpByProviderOperation.prototype.map = function (entity, next) {
        var acc = accountHelper.Helper.map(entity);
        next(null, acc);
    };
    SignUpByProviderOperation.prototype.respond = function (cb, err, acc) {
        var response = {
            error: err,
            account: acc
        };
        cb(response);
    };
    return SignUpByProviderOperation;
})(operation.Operation);
exports.SignUpByProviderOperation = SignUpByProviderOperation;
//# sourceMappingURL=signUpByProviderOperation.js.map