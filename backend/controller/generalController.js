var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var controller = require('./base/controller');
var getMltOp = require('../operation/general/getMltOperation');
var getUserOp = require('../operation/general/getCurrentUserOperation');
var saveFeedbackOp = require('../operation/general/saveFeedbackOperation');
var GeneralController = (function (_super) {
    __extends(GeneralController, _super);
    function GeneralController() {
        var _this = this;
        _super.apply(this, arguments);
        this.getMlt = function (req, res, next) {
            new getMltOp.GetMltOperation(req).execute(function (response) {
                res.send(response);
            });
        };
        this.getCurrentUser = function (req, res, next) {
            var request = _this.getPayload(req);
            new getUserOp.GetCurrentUserOperation(request).execute(function (response) {
                res.send(response);
            });
        };
        this.saveFeedback = function (req, res, next) {
            new saveFeedbackOp.SaveFeedbackOperation(null, req, res).execute(function (response) {
                res.send(response);
            });
        };
    }
    GeneralController.prototype.getConfig = function () {
        return {
            name: 'general',
            actions: [
                {
                    name: 'getmlt',
                    func: this.getMlt,
                    method: 1,
                    roles: []
                },
                {
                    name: 'getCurrentUser',
                    func: this.getCurrentUser,
                    method: 1,
                    roles: []
                },
                {
                    name: 'saveFeedback',
                    func: this.saveFeedback,
                    method: 2,
                    roles: []
                }
            ]
        };
    };
    return GeneralController;
})(controller.Controller);
exports.GeneralController = GeneralController;
//# sourceMappingURL=generalController.js.map