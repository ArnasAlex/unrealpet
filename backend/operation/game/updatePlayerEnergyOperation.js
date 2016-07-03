var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var playerEntity = require('../../entities/playerEntity');
var UpdatePlayerEnergyOperation = (function (_super) {
    __extends(UpdatePlayerEnergyOperation, _super);
    function UpdatePlayerEnergyOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.updateEnergy = function (next) {
            var player = _this.request.player;
            var maxEnergy = playerEntity.PlayerEntity.maxEnergy;
            if (player.availableEnergy === maxEnergy) {
                next();
                return;
            }
            var updatePlayer = false;
            if (!player.energyIncreasedOn || isNaN(player.availableEnergy) || !isFinite(player.availableEnergy)) {
                player.energy = 1;
                player.energyIncreasedOn = new Date();
                player.availableEnergy = maxEnergy;
                updatePlayer = true;
            }
            else {
                var now = new Date().getTime();
                var energyIncreasedOn = Date.parse(player.energyIncreasedOn.toString());
                var difference = now - energyIncreasedOn;
                var energyGrowth = Math.floor(difference / playerEntity.PlayerEntity.energyIncrementTime);
                if (energyGrowth > 0) {
                    player.availableEnergy += energyGrowth;
                    player.energyIncreasedOn = new Date(energyIncreasedOn + (energyGrowth * playerEntity.PlayerEntity.energyIncrementTime));
                    updatePlayer = true;
                }
                if (player.availableEnergy > maxEnergy) {
                    player.availableEnergy = maxEnergy;
                }
            }
            if (updatePlayer) {
                _this.save(playerEntity.CollectionName, player, next);
                return;
            }
            next();
        };
        this.respond = function (err) {
            if (err)
                _this.response.error = err;
            _this.cb(_this.response);
        };
    }
    UpdatePlayerEnergyOperation.prototype.execute = function (cb) {
        this.cb = cb;
        this.response = {};
        this.async.waterfall([
            this.updateEnergy
        ], this.respond);
    };
    return UpdatePlayerEnergyOperation;
})(operation.Operation);
exports.UpdatePlayerEnergyOperation = UpdatePlayerEnergyOperation;
//# sourceMappingURL=updatePlayerEnergyOperation.js.map