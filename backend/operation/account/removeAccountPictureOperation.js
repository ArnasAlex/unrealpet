var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var accountEntity = require('../../entities/accountEntity');
var removeFileOp = require('../general/removeFileOperation');
var cons = require('../../core/constants');
var RemoveAccountPictureOperation = (function (_super) {
    __extends(RemoveAccountPictureOperation, _super);
    function RemoveAccountPictureOperation() {
        _super.apply(this, arguments);
    }
    RemoveAccountPictureOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.getAccount.bind(this),
            this.removeFile.bind(this),
            this.updateAccount.bind(this)
        ], this.respond.bind(this, cb));
    };
    RemoveAccountPictureOperation.prototype.getAccount = function (next) {
        var id = this.getObjectId(this.request.accountId);
        this.mustFindOne(accountEntity.CollectionName, { _id: id }, function (err, res) {
            next(err, res);
        });
    };
    RemoveAccountPictureOperation.prototype.removeFile = function (account, next) {
        var pic = this.request.type === 1 ? account.picture : account.logo;
        if (pic) {
            var cb = function (err) {
                next(err, account);
            };
            this.executeRemoveFileOperation(pic, cb);
        }
        else {
            next(null, account);
        }
    };
    RemoveAccountPictureOperation.prototype.executeRemoveFileOperation = function (pictureUrl, cb) {
        var _this = this;
        var req = {
            filePath: cons.Constants.getFilePathFromUrl(pictureUrl)
        };
        new removeFileOp.RemoveFileOperation(req).execute(function (res) {
            var err = res.error;
            if (err) {
                err = _this.defaultErrorMsg();
            }
            cb(err);
        });
    };
    RemoveAccountPictureOperation.prototype.updateAccount = function (account, next) {
        if (this.request.type === 1) {
            account.picture = null;
        }
        else {
            account.logo = null;
        }
        this.save(accountEntity.CollectionName, account, function (err, res) {
            next(err);
        });
    };
    RemoveAccountPictureOperation.prototype.respond = function (cb, err) {
        var response = { error: err };
        cb(response);
    };
    return RemoveAccountPictureOperation;
})(operation.Operation);
exports.RemoveAccountPictureOperation = RemoveAccountPictureOperation;
//# sourceMappingURL=removeAccountPictureOperation.js.map