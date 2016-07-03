var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var entity = require('./base/entity');
var JobDataEntity = (function (_super) {
    __extends(JobDataEntity, _super);
    function JobDataEntity() {
        _super.call(this);
    }
    return JobDataEntity;
})(entity.Entity);
exports.JobDataEntity = JobDataEntity;
exports.CollectionName = 'jobdata';
//# sourceMappingURL=jobDataEntity.js.map