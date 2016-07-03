var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var controller = require('./base/controller');
var getAccOp = require('../operation/account/getAccountOperation');
var getAccSettingsOp = require('../operation/account/getAccountSettingsOperation');
var saveAccOp = require('../operation/account/saveAccountOperation');
var saveAccSettingsOp = require('../operation/account/saveAccountSettingsOperation');
var uploadAddPicOp = require('../operation/account/uploadAccountPictureOperation');
var removeAccPicOp = require('../operation/account/removeAccountPictureOperation');
var AccountController = (function (_super) {
    __extends(AccountController, _super);
    function AccountController() {
        var _this = this;
        _super.apply(this, arguments);
        this.getAccount = function (req, res, next) {
            var request = _this.getPayload(req);
            new getAccOp.GetAccountOperation(request).execute(function (response) {
                res.send(response);
            });
        };
        this.getAccountSettings = function (req, res, next) {
            var request = _this.getPayload(req);
            new getAccSettingsOp.GetAccountSettingsOperation(request).execute(function (response) {
                res.send(response);
            });
        };
        this.saveAccount = function (req, res, next) {
            var request = _this.getPayload(req);
            new saveAccOp.SaveAccountOperation(request).execute(function (response) {
                res.send(response);
            });
        };
        this.saveAccountSettings = function (req, res, next) {
            var request = _this.getPayload(req);
            new saveAccSettingsOp.SaveAccountSettingsOperation(request).execute(function (response) {
                res.send(response);
            });
        };
        this.uploadAccountPicture = function (req, res, next) {
            var request = {
                expressRequest: req,
                expressResponse: res,
                accountId: req.user.id
            };
            new uploadAddPicOp.UploadAccountPictureOperation(request).execute(function (response) {
                res.send(response);
            });
        };
        this.removeAccountPicture = function (req, res, next) {
            var request = _this.getPayload(req);
            new removeAccPicOp.RemoveAccountPictureOperation(request).execute(function (response) {
                res.send(response);
            });
        };
    }
    AccountController.prototype.getConfig = function () {
        return {
            name: 'account',
            actions: [
                {
                    name: 'getAccount',
                    func: this.getAccount,
                    method: 1,
                    roles: [1]
                },
                {
                    name: 'getAccountSettings',
                    func: this.getAccountSettings,
                    method: 1,
                    roles: [1]
                },
                {
                    name: 'saveAccount',
                    func: this.saveAccount,
                    method: 2,
                    roles: [1]
                },
                {
                    name: 'saveAccountSettings',
                    func: this.saveAccountSettings,
                    method: 2,
                    roles: [1]
                },
                {
                    name: 'uploadAccountPicture',
                    func: this.uploadAccountPicture,
                    method: 2,
                    roles: [1]
                },
                {
                    name: 'removeAccountPicture',
                    func: this.removeAccountPicture,
                    method: 2,
                    roles: [1]
                }
            ]
        };
    };
    return AccountController;
})(controller.Controller);
exports.AccountController = AccountController;
//# sourceMappingURL=accountController.js.map