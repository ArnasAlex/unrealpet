/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import playerEntity = require('../../entities/playerEntity');
import updateGameEnergyOperation = require('./updatePlayerEnergyOperation');

export class GetPlayerInfoOperation extends operation.Operation {
    protected request: IGetPlayerInfoRequest;
    private cb: (response: IResponse) => void;
    private response: IGetPlayerInfoResponse;

    public execute(cb: (response: IResponse) => void) {
        this.cb = cb;
        this.response = <any>{};

        this.async.waterfall([
                this.getPlayer,
                this.getPlayerCount,
                this.getPlace
            ],
            this.respond);
    }

    private getPlayer = (next) => {
        var query = new playerEntity.PlayerEntity();
        query.accountId = this.currentUserObjectId();
        this.findOne(playerEntity.CollectionName, query, (err, player) => {
            if (!err && player){
                var req: updateGameEnergyOperation.IUpdatePlayerEnergyRequest = {
                    player: player
                };

                this.executeUpdateEnergyOperation(req, (res) => {
                    var saveErr = res.error;
                    if (saveErr){
                        next(saveErr);
                        return;
                    }

                    this.response.pictureUrl = player.pictureUrl;
                    this.response.defeats = player.defeat;
                    this.response.wins = player.win;
                    this.response.fights = player.fights;
                    this.response.points = player.points;
                    this.response.status = player.status;
                    this.response.energy = player.energy;
                    this.response.isRegistered = true;
                    this.response.hasGift = this.hasGift(player);

                    next();
                });

                return;
            }

            next(err);
        });
    };

    private hasGift(player: playerEntity.PlayerEntity){
        var giftArrivesOn = player.giftArrivesOn;
        var now = new Date().getTime();
        return !giftArrivesOn || new Date(giftArrivesOn.toString()).getTime() < now;
    }

    private executeUpdateEnergyOperation = (req: updateGameEnergyOperation.IUpdatePlayerEnergyRequest, cb) => {
        new updateGameEnergyOperation.UpdatePlayerEnergyOperation(req).execute(cb);
    };

    private getPlayerCount = (next) => {
        this.db.collection(playerEntity.CollectionName).count({}, (err, res: number) => {
            if (!err){
                this.response.totalPlayers = res;
            }
            next(err);
        });
    };

    private getPlace = (next) => {
        if (!this.response.isRegistered){
            next();
            return;
        }

        var query = {
            points: {$gt: this.response.points}
        };
        this.db.collection(playerEntity.CollectionName).count(query, (err, res: number) => {
            if (!err){
                this.response.place = res + 1;
            }
            next(err);
        });
    };

    private respond = (err) => {
        if (err) this.response.error = err;
        this.cb(this.response);
    }
}