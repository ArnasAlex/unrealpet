var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var entity = require('./base/entity');
var FightEntity = (function (_super) {
    __extends(FightEntity, _super);
    function FightEntity() {
        _super.call(this);
    }
    return FightEntity;
})(entity.Entity);
exports.FightEntity = FightEntity;
exports.CollectionName = 'fight';
//# sourceMappingURL=fightEntity.js.map