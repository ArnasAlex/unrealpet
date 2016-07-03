var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var entity = require('./base/entity');
var ConnectionEntity = (function (_super) {
    __extends(ConnectionEntity, _super);
    function ConnectionEntity() {
        _super.call(this);
    }
    return ConnectionEntity;
})(entity.Entity);
exports.ConnectionEntity = ConnectionEntity;
exports.CollectionName = 'connection';
//# sourceMappingURL=connectionEntity.js.map