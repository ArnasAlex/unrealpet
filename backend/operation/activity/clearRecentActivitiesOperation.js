var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var activityEntity = require('../../entities/activityEntity');
var ClearRecentActivitiesOperation = (function (_super) {
    __extends(ClearRecentActivitiesOperation, _super);
    function ClearRecentActivitiesOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.updateActivities = function (next) {
            var query = {
                accountId: _this.currentUserObjectId()
            };
            _this.remove(activityEntity.CollectionName, query, next);
        };
        this.respond = function (err) {
            var response = {
                error: err
            };
            _this.cb(response);
        };
    }
    ClearRecentActivitiesOperation.prototype.execute = function (cb) {
        this.cb = cb;
        this.async.waterfall([
            this.updateActivities
        ], this.respond);
    };
    return ClearRecentActivitiesOperation;
})(operation.Operation);
exports.ClearRecentActivitiesOperation = ClearRecentActivitiesOperation;
//# sourceMappingURL=clearRecentActivitiesOperation.js.map