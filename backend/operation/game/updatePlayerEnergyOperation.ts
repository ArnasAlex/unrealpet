/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import playerEntity = require('../../entities/playerEntity');

export class UpdatePlayerEnergyOperation extends operation.Operation {
    protected request: IUpdatePlayerEnergyRequest;
    private cb: (response: IUpdatePlayerEnergyResponse) => void;
    private response: IUpdatePlayerEnergyResponse;

    public execute(cb: (response: IUpdatePlayerEnergyResponse) => void) {
        this.cb = cb;
        this.response = <any>{};

        this.async.waterfall([
                this.updateEnergy
            ],
            this.respond);
    }

    private updateEnergy = (next) => {
        var player = this.request.player;
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
            this.save(playerEntity.CollectionName, player, next);
            return;
        }

        next();
    };

    private respond = (err) => {
        if (err) this.response.error = err;
        this.cb(this.response);
    };
}

export interface IUpdatePlayerEnergyRequest extends IRequest {
    player: playerEntity.PlayerEntity
}
export interface IUpdatePlayerEnergyResponse extends IResponse {}
