var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var entity = require('./base/entity');
var PlayerEntity = (function (_super) {
    __extends(PlayerEntity, _super);
    function PlayerEntity() {
        _super.call(this);
    }
    PlayerEntity.maxEnergy = 20;
    PlayerEntity.energyIncrementTime = 1000 * 60 * 15;
    return PlayerEntity;
})(entity.Entity);
exports.PlayerEntity = PlayerEntity;
exports.CollectionName = 'player';
//# sourceMappingURL=playerEntity.js.map