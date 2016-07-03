/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import playerEntity = require('../../entities/playerEntity');
import accountEntity = require('../../entities/accountEntity');
import fightEntity = require('../../entities/fightEntity');

export class GetGameFightsOperation extends operation.Operation {
    protected request: IGetGameFightsRequest;
    private cb: (response: IGetGameFightsResponse) => void;
    private response: IGetGameFightsResponse;
    private players: playerEntity.PlayerEntity[];
    private currentPlayer: playerEntity.PlayerEntity;

    public execute(cb: (response: IGetGameFightsResponse) => void) {
        this.cb = cb;
        this.response = <any>{};
        this.parseSearchRequest(this.request);

        this.async.waterfall([
                this.getCurrentUserPlayer,
                this.getFights,
                this.fillPlayerInfo,
                this.fillAccountInfo,
                this.fillPlaces,
                this.getFightCount
            ],
            this.respond);
    }

    private getCurrentUserPlayer = (next) => {
        var query = {accountId: this.currentUserObjectId()};
        this.findOne(playerEntity.CollectionName, query, (err, res) => {
            this.currentPlayer = res;
            next(err);
        });
    };

    private getFights = (next) => {
        if (!this.currentPlayer){
            next(null);
            return;
        }
        var currentUserPlayerId = this.currentPlayer._id;
        var sort = {updatedOn: -1};
        var query = this.getFightQuery();

        this.db.collection(fightEntity.CollectionName)
            .find(query)
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
                        this.response.list.push(this.map(res[i], currentUserPlayerId));
                    }
                }

                next(err);
            });
    };

    private map(fight: fightEntity.FightEntity, currentUserPlayerId){
        var currentPlayerPoints = fight.player1Id.equals(currentUserPlayerId) ? fight.player1Points : fight.player2Points;
        var isWin = fight.winnerId.equals(currentUserPlayerId);

        var opponentId = fight.player1Id.equals(currentUserPlayerId)
            ? fight.player2Id.toString()
            : fight.player1Id.toString();

        var result: IGameFight = {
            id: fight._id.toString(),
            opponentPlayerId: opponentId.toString(),
            opponentAccountId: null,
            opponentName: null,
            opponentPicture: null,
            opponentPlace: null,
            isWin: isWin,
            points: currentPlayerPoints,
            date: fight.updatedOn.toString(),
            status: fight.status
        };

        this.hideFightResults(result);

        return result;
    }

    private hideFightResults(fight: IGameFight){
        var status = fight.status;
        var isFightHidden = status === FightStatus.Initial || status === FightStatus.Playing;
        if (!isFightHidden){
            return;
        }

        fight.isWin = undefined;
        fight.points = undefined;
    }

    private fillPlayerInfo = (next) => {
        if (!this.currentPlayer){
            next(null);
            return;
        }

        var playerIds = this._.map(this.response.list, (x: IGameFight) => this.getObjectId(x.opponentPlayerId));
        var query = { _id: {$in: playerIds}};
        this.db.collection(playerEntity.CollectionName)
            .find(query)
            .toArray((err: any, res: playerEntity.PlayerEntity[]) => {
            if (err){
                this.logDbError(err);
                err = this.defaultErrorMsg();
            }
            else{
                this._.each(this.response.list, (fight: IGameFight) => {
                    var player = this._.find(res,  x => x._id.toString() == fight.opponentPlayerId);
                    fight.opponentAccountId = player.accountId.toString();
                    fight.opponentPicture = player.pictureUrl;
                });
                this.players = res;
            }
            next(err);
        });
    };

    private fillAccountInfo = (next) => {
        if (!this.currentPlayer){
            next(null);
            return;
        }

        var accountIds = this._.map(this.response.list, (x: IGameFight) => this.getObjectId(x.opponentAccountId));
        var query = { _id: {$in: accountIds}};
        this.db.collection(accountEntity.CollectionName)
            .find(query)
            .toArray((err: any, res: accountEntity.AccountEntity[]) => {
            if (err){
                this.logDbError(err);
                err = this.defaultErrorMsg();
            }
            else{
                this._.each(this.response.list, (fight: IGameFight) => {
                    var account = this._.find(res,  x => x._id.toString() == fight.opponentAccountId);
                    fight.opponentName = account.name;
                });
            }
            next(err);
        });
    };

    private fillPlaces = (next) => {
        if (!this.currentPlayer || this.players.length == 0){
            next(null);
            return;
        }

        this.async.each(this.players, this.getPlayerPlace, next);
    };

    private getPlayerPlace = (player: playerEntity.PlayerEntity, cb) => {
        var query = {points: {$gt: player.points}};
        this.db.collection(playerEntity.CollectionName).count(query, (err, res) => {
            if (!err){
                this._.each(this.response.list, fight => {
                    if (fight.opponentPlayerId === player._id.toString()){
                        fight.opponentPlace = res + 1;
                    }
                });
            }
            cb(err);
        });
    };

    private getFightCount = (next) => {
        if (!this.currentPlayer || this.request.skip !== 0){
            next();
            return;
        }

        var query = this.getFightQuery();
        this.db.collection(fightEntity.CollectionName).count(query, (err, res) => {
            this.response.totalCount = res;
            next(err);
        });
    };

    private getFightQuery = () =>{
        return {
            $or: [
                {player1Id: this.currentPlayer._id},
                {player2Id: this.currentPlayer._id}
            ],
            winnerId: {$exists: true}
        };
    };

    private respond = (err) => {
        if (err) this.response.error = err;
        this.cb(this.response);
    }
}