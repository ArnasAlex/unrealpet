/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import playerEntity = require('../../entities/playerEntity');
import accountEntity = require('../../entities/accountEntity');

export class GetGameLeadersOperation extends operation.Operation {
    protected request: IGetGameLeadersRequest;
    private cb: (response: IGetGameLeadersResponse) => void;
    private response: IGetGameLeadersResponse;

    public execute(cb: (response: IGetGameLeadersResponse) => void) {
        this.cb = cb;
        this.response = <any>{};
        this.parseSearchRequest(this.request);

        this.async.waterfall([
                this.getPlayers,
                this.getCount,
                this.getAccounts
            ],
            this.respond);
    }

    private getPlayers = (next) => {
        var sort = {points: -1};

        this.db.collection(playerEntity.CollectionName)
            .find({})
            .sort(sort)
            .skip(this.request.skip)
            .limit(this.request.take)
            .toArray((err: any, res) => {
            if (err){
                this.logDbError(err);
                err = this.defaultErrorMsg();
            }
            else {
                this.response.list = [];
                for (var i = 0; i < res.length; i++){
                    this.response.list.push(this.map(res[i], i));
                }
            }

            next(err);
        });
    };

    private map = (player: playerEntity.PlayerEntity, nr: number) => {
        var place = this.request.skip + nr + 1;
        var result: IGameLeader = {
            id: player._id.toString(),
            accountId: player.accountId.toString(),
            place: place,
            name: null,
            picture: null,
            points: player.points,
            type: null
        };

        return result;
    };

    private getCount = (next) => {
        if (this.request.skip !== 0){
            next(null);
            return;
        }

        this.db.collection(playerEntity.CollectionName).count({}, (err: any, res) => {
            if (err){
                this.logDbError(err);
                err = this.defaultErrorMsg();
            }
            else{
                this.response.totalCount = res;
            }

            next(err);
        });
    };

    private getAccounts = (next) => {
        var ids = this._.map(this.response.list, x => this.getObjectId(x.accountId));
        var query = {
            _id: {$in: ids}
        };

        this.db.collection(accountEntity.CollectionName).find(query).toArray((err, res: accountEntity.AccountEntity[]) => {
            if (err){
                this.logDbError(err);
                err = this.defaultErrorMsg();
            }
            else {
                this._.each(this.response.list, (leader: IGameLeader) => {
                    var acc = this._.find(res, x => x._id.toString() === leader.accountId);
                    if (acc){
                        leader.name = acc.name;
                        leader.picture = acc.logo;
                        leader.type = acc.type;
                    }
                });
            }

            next(err);
        });
    };

    private respond = (err) => {
        if (err) this.response.error = err;
        this.cb(this.response);
    }
}