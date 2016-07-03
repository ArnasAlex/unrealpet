/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import playerEntity = require('../../entities/playerEntity');
import fightEntity = require('../../entities/fightEntity');

export class GetGameFightOperation extends operation.Operation {
    protected request: IGetGameFightRequest;
    private cb: (response: IGetGameFightResponse) => void;
    private response: IGetGameFightResponse;

    public execute(cb: (response: IGetGameFightResponse) => void) {
        this.cb = cb;
        this.response = <any>{};

        this.async.waterfall([
                this.getPlayers,
                this.choosePlayers,
                this.getPlayersPlace,
                this.createFight,
                this.updatePlayers
            ],
            this.respond);
    }

    private getPlayers = (next) => {
        var query: any = {};
        if (this.currentUserObjectId()){
            query.accountId = {$not: {$eq: this.currentUserObjectId()}};
        }
        query.status = PlayerStatus.Playing;

        var sort = {lastFightOn: 1};

        this.db.collection(playerEntity.CollectionName).find(query).sort(sort).limit(10).toArray((err: any, res) => {
            if (err){
                this.logDbError(err);
                err = this.defaultErrorMsg();
            }

            next(err, res);
        });
    };

    private choosePlayers = (players: playerEntity.PlayerEntity[], next) => {
        if (players.length >= 2){
            this.response.players = [];
            var player1 = this.getRandomPlayer(players);
            this.response.players.push(this.mapPlayer(player1));

            var player2 = this.getRandomPlayer(players);
            this.response.players.push(this.mapPlayer(player2));
            players = [player1, player2];
        }

        next(null, players);
    };

    private mapPlayer(player: playerEntity.PlayerEntity){
        var mappedPlayer: IGameFightPlayer = {
            id: player._id.toString(),
            picture: player.pictureUrl,
            place: null
        };

        return mappedPlayer;
    }

    private getRandomPlayer(players: playerEntity.PlayerEntity[]){
        var randomNr = Math.floor(Math.random() * players.length);
        var player = players[randomNr];
        players.splice(randomNr, 1);

        return player;
    }

    private getPlayersPlace = (players: playerEntity.PlayerEntity[], next) => {
        if (!this.response.players){
            next(null);
            return;
        }

        this.async.each(players, this.getPlayerPlace, next);
    };

    private getPlayerPlace = (player: playerEntity.PlayerEntity, cb) => {
        var query = {points: {$gt: player.points}};
        this.db.collection(playerEntity.CollectionName).count(query, (err, res) => {
            if (!err){
                var responsePlayer = this._.find(this.response.players, x => x.id === player._id.toString());
                responsePlayer.place = res + 1;
            }
            cb(err);
        });
    };

    private createFight = (next) => {
        if (!this.response.players){
            next(null);
            return;
        }

        var fight = new fightEntity.FightEntity();
        fight._id = this.getId();
        fight.player1Id = this.getObjectId(this.response.players[0].id);
        fight.player2Id = this.getObjectId(this.response.players[1].id);
        var voterId = this.currentUserObjectId();
        if (voterId){
            fight.voterId = voterId;
        }
        else{
            fight.voterIp = this.currentUserIp();
        }

        this.response.id = fight._id.toString();
        this.save(fightEntity.CollectionName, fight, (err, res) => { next(err); });
    };

    private updatePlayers = (next) => {
        if (!this.response.players){
            next(null);
            return;
        }

        var ids = this._.map(this.response.players, x => this.getObjectId(x.id));
        var query = { _id: {$in: ids}};
        this.update(playerEntity.CollectionName, query, {$set: {lastFightOn: new Date()}}, next);
    };

    private respond = (err) => {
        if (err) this.response.error = err;
        this.cb(this.response);
    }
}