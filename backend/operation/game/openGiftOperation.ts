/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import playerEntity = require('../../entities/playerEntity');

export class OpenGiftOperation extends operation.Operation {
    protected request: IOpenGiftRequest;
    private cb: (response: IResponse) => void;
    private response: IOpenGiftResponse;

    public execute(cb: (response: IOpenGiftResponse) => void) {
        this.cb = cb;
        this.response = <any>{};
        this.response.points = 0;

        this.async.waterfall([
                this.getPlayer,
                this.updatePlayer
            ],
            this.respond);
    }

    private getPlayer = (next) => {
        var query = new playerEntity.PlayerEntity();
        query.accountId = this.currentUserObjectId();
        this.mustFindOne(playerEntity.CollectionName, query, next);
    };

    private updatePlayer = (player: playerEntity.PlayerEntity, next) => {
        if (!this.hasGift(player)){
            next();
            return;
        }

        var giftPoints = this.getRandomBetween(1, 10);
        this.response.points = giftPoints;

        player.points += giftPoints;
        player.giftArrivesOn = this.getNewGiftDate();

        this.save(playerEntity.CollectionName, player, next);
    };

    private getNewGiftDate = () => {
        var randomHours = this.getRandomBetween(3, 24);
        var arrivesOn = new Date();
        arrivesOn.setHours(arrivesOn.getHours() + randomHours);

        return arrivesOn;
    };

    private hasGift(player: playerEntity.PlayerEntity){
        var giftArrivesOn = player.giftArrivesOn;
        var now = new Date().getTime();
        return !giftArrivesOn || new Date(giftArrivesOn.toString()).getTime() < now;
    }

    private respond = (err) => {
        if (err) this.response.error = err;
        this.cb(this.response);
    }
}