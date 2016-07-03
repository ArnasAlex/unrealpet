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
var hash = require('node_hash');
var LoginOperation = (function (_super) {
    __extends(LoginOperation, _super);
    function LoginOperation() {
        _super.apply(this, arguments);
    }
    LoginOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.getUser.bind(this)
        ], this.respond.bind(this, cb));
    };
    LoginOperation.prototype.getUser = function (next) {
        var _this = this;
        var email = this.request.email.toLowerCase();
        var hashedPassword = this.hash(this.request.password, email);
        var doc = {
            email: email,
            password: hashedPassword
        };
        this.db.collection(accountEntity.CollectionName).findOne(doc, function (err, res) {
            if (!err) {
                if (!res) {
                    err = _this.mlt.login_wrong_email_or_password;
                }
            }
            else {
                _this.logDbError(err);
                err = _this.defaultErrorMsg();
            }
            var account = res
                ? accountHelper.Helper.map(res)
                : null;
            next(err, account);
        });
    };
    LoginOperation.prototype.hash = function (email, password) {
        return hash.sha256(email, password);
    };
    LoginOperation.prototype.respond = function (cb, err, account) {
        var response = {
            error: err,
            account: account
        };
        cb(response);
    };
    return LoginOperation;
})(operation.Operation);
exports.LoginOperation = LoginOperation;
//# sourceMappingURL=loginOperation.js.map