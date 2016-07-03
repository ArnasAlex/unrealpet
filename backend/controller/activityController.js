var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var controller = require('./base/controller');
var getRecentActivitiesOp = require('../operation/activity/getRecentActivitiesOperation');
var clearRecentActivitiesOp = require('../operation/activity/clearRecentActivitiesOperation');
var getUpdatesOp = require('../operation/activity/getUpdatesOperation');
var ActivityController = (function (_super) {
    __extends(ActivityController, _super);
    function ActivityController() {
        _super.apply(this, arguments);
        this.getRecentActivities = function (req, res, next) {
            new getRecentActivitiesOp.GetRecentActivitiesOperation(null, req).execute(function (response) {
                res.send(response);
            });
        };
        this.clearRecentActivities = function (req, res, next) {
            new clearRecentActivitiesOp.ClearRecentActivitiesOperation(null, req, res).execute(function (response) {
                res.send(response);
            });
        };
        this.getUpdates = function (req, res, next) {
            new getUpdatesOp.GetUpdatesOperation(null, req).execute(function (response) {
                res.send(response);
            });
        };
    }
    ActivityController.prototype.getConfig = function () {
        return {
            name: 'activity',
            actions: [
                {
                    name: 'getRecentActivities',
                    func: this.getRecentActivities,
                    method: 1,
                    roles: [1]
                },
                {
                    name: 'clearRecentActivities',
                    func: this.clearRecentActivities,
                    method: 2,
                    roles: [1]
                },
                {
                    name: 'getUpdates',
                    func: this.getUpdates,
                    method: 1,
                    roles: [1]
                }
            ]
        };
    };
    return ActivityController;
})(controller.Controller);
exports.ActivityController = ActivityController;
//# sourceMappingURL=activityController.js.map