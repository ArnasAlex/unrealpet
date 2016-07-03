var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var activityEntity = require('../../entities/activityEntity');
var GetRecentActivitiesOperation = (function (_super) {
    __extends(GetRecentActivitiesOperation, _super);
    function GetRecentActivitiesOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.getActivities = function (next) {
            var todayMinusMonth = new Date();
            todayMinusMonth.setMonth(-1);
            var query = {
                accountId: _this.currentUserObjectId(),
                createdOn: { $gt: todayMinusMonth }
            };
            var sort = { createdOn: -1 };
            _this.db.collection(activityEntity.CollectionName).find(query).sort(sort).toArray(next);
        };
        this.map = function (activities, next) {
            var list = _this._.map(activities, function (activity) {
                var recentActivity = {
                    relatedId: activity.relatedId.toString(),
                    title: activity.title,
                    message: activity.message,
                    type: activity.type
                };
                return recentActivity;
            });
            next(null, list);
        };
        this.respond = function (err, activities) {
            var response = {
                error: err,
                list: activities
            };
            _this.cb(response);
        };
    }
    GetRecentActivitiesOperation.prototype.execute = function (cb) {
        this.cb = cb;
        this.async.waterfall([
            this.getActivities,
            this.map
        ], this.respond);
    };
    return GetRecentActivitiesOperation;
})(operation.Operation);
exports.GetRecentActivitiesOperation = GetRecentActivitiesOperation;
//# sourceMappingURL=getRecentActivitiesOperation.js.map