var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var controller = require('./base/controller');
var getConOp = require('../operation/admin/getConnectionsOperation');
var getAccOp = require('../operation/admin/getAccountsOperation');
var getErrOp = require('../operation/admin/getErrorsOperation');
var uploadCoverPictureOp = require('../operation/admin/uploadCoverPictureOperation');
var getFeedbacksOp = require('../operation/admin/getFeedbacksOperation');
var AdminController = (function (_super) {
    __extends(AdminController, _super);
    function AdminController() {
        var _this = this;
        _super.apply(this, arguments);
        this.getConnections = function (req, res, next) {
            var request = _this.getPayload(req);
            new getConOp.GetConnectionsOperation(request).execute(function (response) {
                res.send(response);
            });
        };
        this.getErrors = function (req, res, next) {
            var request = _this.getPayload(req);
            new getErrOp.GetErrorsOperation(request).execute(function (response) {
                res.send(response);
            });
        };
        this.uploadCoverPicture = function (req, res, next) {
            new uploadCoverPictureOp.UploadCoverPictureOperation(null, req, res).execute(function (response) {
                res.send(response);
            });
        };
        this.getAccounts = function (req, res, next) {
            var request = _this.getPayload(req);
            new getAccOp.GetAccountsOperation(request).execute(function (response) {
                res.send(response);
            });
        };
        this.getFeedbacks = function (req, res, next) {
            new getFeedbacksOp.GetFeedbacksOperation(null, req, res).execute(function (response) {
                res.send(response);
            });
        };
    }
    AdminController.prototype.getConfig = function () {
        return {
            name: 'admin',
            actions: [
                {
                    name: 'getConnections',
                    func: this.getConnections,
                    method: 1,
                    roles: [2]
                },
                {
                    name: 'getErrors',
                    func: this.getErrors,
                    method: 1,
                    roles: [2]
                },
                {
                    name: 'getAccounts',
                    func: this.getAccounts,
                    method: 1,
                    roles: [2]
                },
                {
                    name: 'uploadCoverPicture',
                    func: this.uploadCoverPicture,
                    method: 2,
                    roles: [2]
                },
                {
                    name: 'getFeedbacks',
                    func: this.getFeedbacks,
                    method: 1,
                    roles: [2]
                }
            ]
        };
    };
    return AdminController;
})(controller.Controller);
exports.AdminController = AdminController;
//# sourceMappingURL=adminController.js.map