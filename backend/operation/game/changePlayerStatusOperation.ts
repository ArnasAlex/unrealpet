/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import playerEntity = require('../../entities/playerEntity');

export class ChangePlayerStatusOperation extends operation.Operation {
    protected request: IChangePlayerStatusRequest;
    private cb: (response: IResponse) => void;
    private response: IChangePlayerStatusResponse;

    public execute(cb: (response: IResponse) => void) {
        this.cb = cb;
        this.response = <any>{};

        this.async.waterfall([
                this.getPlayer,
                this.changeStatus
            ],
            this.respond);
    }

    private getPlayer = (next) => {
        var query = new playerEntity.PlayerEntity();
        query.accountId = this.currentUserObjectId();
        this.mustFindOne(playerEntity.CollectionName, query, next);
    };

    private changeStatus = (player: playerEntity.PlayerEntity, next) => {
        player.status = this.request.status;
        this.save(playerEntity.CollectionName, player, next);
    };

    private respond = (err) => {
        if (err) this.response.error = err;
        this.cb(this.response);
    }
}