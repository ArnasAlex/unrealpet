var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var activityEntity = require('../../entities/activityEntity');
var envCfg = require('../../config/environmentConfig');
var packageJson = require('../../../package.json');
var GetUpdatesOperation = (function (_super) {
    __extends(GetUpdatesOperation, _super);
    function GetUpdatesOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.versionForDevelop = 'develop';
        this.getActivities = function (next) {
            var todayMinusMonth = new Date();
            todayMinusMonth.setMonth(-1);
            var query = {
                accountId: _this.currentUserObjectId(),
                createdOn: { $gt: todayMinusMonth }
            };
            _this.db.collection(activityEntity.CollectionName).count(query, function (err, count) {
                _this.response.hasActivities = count > 0;
                next(err);
            });
        };
        this.getVersion = function (next) {
            if (!GetUpdatesOperation.version) {
                var env = _this.getEnvironment();
                GetUpdatesOperation.version = env != envCfg.Environment.Local
                    ? packageJson.version
                    : _this.versionForDevelop;
            }
            _this.response.version = GetUpdatesOperation.version;
            next(null);
        };
        this.getEnvironment = function () {
            return envCfg.EnvironmentConfig.getEnvironment();
        };
        this.respond = function (err) {
            if (err)
                _this.response.error = err;
            _this.cb(_this.response);
        };
    }
    GetUpdatesOperation.prototype.execute = function (cb) {
        this.cb = cb;
        this.response = {};
        this.async.waterfall([
            this.getActivities,
            this.getVersion
        ], this.respond);
    };
    return GetUpdatesOperation;
})(operation.Operation);
exports.GetUpdatesOperation = GetUpdatesOperation;
//# sourceMappingURL=getUpdatesOperation.js.map