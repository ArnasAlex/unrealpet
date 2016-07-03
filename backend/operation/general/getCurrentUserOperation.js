var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var accountEntity = require('../../entities/accountEntity');
var postEntity = require('../../entities/postEntity');
var GetCurrentUserOperation = (function (_super) {
    __extends(GetCurrentUserOperation, _super);
    function GetCurrentUserOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.getAccount = function (next) {
            var accountId = _this.request.accountId;
            if (!accountId) {
                next(null, _this.getUnauthenticatedUser());
                return;
            }
            _this.getAuthenticatedUser(next, accountId);
        };
        this.getPostInfo = function (user, next) {
            var accountId = _this.request.accountId;
            if (!accountId) {
                next(null, user);
                return;
            }
            var query = { ownerId: _this.getObjectId(accountId) };
            _this.db.collection(postEntity.CollectionName).count(query, function (err, res) {
                if (err) {
                    _this.logDbError(err.toString());
                }
                else {
                    user.postCount = res;
                }
                next(err, user);
            });
        };
    }
    GetCurrentUserOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.getAccount,
            this.getPostInfo
        ], this.respond.bind(this, cb));
    };
    GetCurrentUserOperation.prototype.getUnauthenticatedUser = function () {
        return {
            isAuthenticated: false,
            email: null,
            language: 0,
            name: null,
            postCount: 0
        };
    };
    GetCurrentUserOperation.prototype.getAuthenticatedUser = function (next, accountId) {
        var _this = this;
        this.db.collection(accountEntity.CollectionName).findOne({ _id: this.getObjectId(accountId) }, function (err, res) {
            var account = null;
            if (!err) {
                if (res) {
                    account = _this.map(res);
                }
                else {
                    _this.logError('Account was not found by id: ' + accountId);
                    account = _this.getUnauthenticatedUser();
                }
            }
            else {
                _this.logDbError(err);
                err = _this.defaultErrorMsg();
            }
            next(err, account);
        });
    };
    GetCurrentUserOperation.prototype.map = function (account) {
        return {
            isAuthenticated: true,
            email: account.email,
            language: account.settings ? account.settings.language : 0,
            name: account.name,
            postCount: 0
        };
    };
    GetCurrentUserOperation.prototype.respond = function (cb, err, acc) {
        var response = { error: err, user: acc };
        cb(response);
    };
    return GetCurrentUserOperation;
})(operation.Operation);
exports.GetCurrentUserOperation = GetCurrentUserOperation;
//# sourceMappingURL=getCurrentUserOperation.js.map