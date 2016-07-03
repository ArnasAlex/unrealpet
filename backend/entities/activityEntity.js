var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var entity = require('./base/entity');
var ActivityEntity = (function (_super) {
    __extends(ActivityEntity, _super);
    function ActivityEntity() {
        _super.call(this);
    }
    return ActivityEntity;
})(entity.Entity);
exports.ActivityEntity = ActivityEntity;
exports.CollectionName = 'activity';
//# sourceMappingURL=activityEntity.js.map