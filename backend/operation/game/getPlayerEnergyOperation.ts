/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import playerEntity = require('../../entities/playerEntity');
import updateEnergyOp = require('./updatePlayerEnergyOperation');

export class GetPlayerEnergyOperation extends operation.Operation {
    protected request: IGetPlayerEnergyRequest;
    private cb: (response: IGetPlayerEnergyResponse) => void;
    private response: IGetPlayerEnergyResponse;
    private player: playerEntity.PlayerEntity;

    public execute(cb: (response: IGetPlayerEnergyResponse) => void) {
        this.cb = cb;
        this.response = <any>{};

        this.async.waterfall([
                this.getPlayer,
                this.updateEnergy
            ],
            this.respond);
    }

    private getPlayer = (next) => {
        var query = {accountId: this.currentUserObjectId()};
        this.findOne(playerEntity.CollectionName, query, (err, res) => {
            this.player = res;

            next(err);
        });
    };

    private updateEnergy = (next) => {
        if (!this.player){
            this.response.availableEnergy = playerEntity.PlayerEntity.maxEnergy;
            this.response.energy = 0;
            next();
            return;
        }

        var req: updateEnergyOp.IUpdatePlayerEnergyRequest = {
            player: this.player
        };

        this.executeUpdateEnergyOperation(req, (res: updateEnergyOp.IUpdatePlayerEnergyResponse) => {
            this.response.availableEnergy = this.player.availableEnergy;
            this.response.energy = this.player.energy;
            next(res.error);
        });
    };

    private executeUpdateEnergyOperation = (req: updateEnergyOp.IUpdatePlayerEnergyRequest, cb) => {
        var op = new updateEnergyOp.UpdatePlayerEnergyOperation(req);
        op.execute(cb);
    };

    private respond = (err) => {
        if (err) this.response.error = err;
        this.cb(this.response);
    }
}