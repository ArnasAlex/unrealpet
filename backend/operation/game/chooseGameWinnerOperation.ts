/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import getGameFightOp = require('./getGameFightOperation');
import playerEntity = require('../../entities/playerEntity');
import fightEntity = require('../../entities/fightEntity');
import mdb = require('mongodb');

export class ChooseGameWinnerOperation extends operation.Operation {
    protected request: IChooseGameWinnerRequest;
    private cb: (response: IChooseGameWinnerResponse) => void;
    private response: IChooseGameWinnerResponse;

    public execute(cb: (response: IChooseGameWinnerResponse) => void) {
        this.cb = cb;
        this.response = <any>{};

        this.async.waterfall([
                this.getFight,
                this.validate,
                this.saveFight,
                this.updatePlayers,
                this.getGameFight,
                this.incrementCurrentPlayerEnergy
            ],
            this.respond);
    }

    private getFight = (next) => {
        var query: any = {_id: this.getObjectId(this.request.fightId)};
        this.mustFindOne(fightEntity.CollectionName, query, next);
    };

    private validate = (fight: fightEntity.FightEntity, next) => {
        if (fight.winnerId){
            next(null, null);
            return;
        }

        var winnerId = this.request.playerId;
        if (fight.player1Id.toString() !== winnerId && fight.player2Id.toString() !== winnerId){
            this.logError('Trying to choose winner which does not belong to fight. Fight Id: ' + this.request.fightId
                + ' winnerId: ' + winnerId, ErrorType.Warning);
            next(null, null);
            return;
        }

        var currentUserId = this.currentUserObjectId();
        var currentUserIp = this.currentUserIp();
        var isRegisteredVoter = currentUserId && fight.voterId && fight.voterId.toString() === currentUserId.toString();
        var isNotRegisteredVoter = fight.voterIp === currentUserIp;
        if (!isRegisteredVoter && !isNotRegisteredVoter){
            this.logError('Trying to vote for fight which does not belong to voter. Fight Id: ' + this.request.fightId
                + ' currentUserIp: ' + currentUserIp + ' currentUserId: ' + currentUserId, ErrorType.Warning);
            next(null, null);
            return;
        }

        next(null, fight);
    };

    private saveFight = (fight: fightEntity.FightEntity, next) => {
        if (!fight){
            next(null, null);
            return;
        }

        var isVoterRegisteredUser = !!fight.voterId;
        fight.player1Points = this.getPoints(fight.player1Id.toString(), isVoterRegisteredUser);
        fight.player2Points = this.getPoints(fight.player2Id.toString(), isVoterRegisteredUser);

        fight.winnerId = this.getObjectId(this.request.playerId);
        fight.status = FightStatus.Initial;
        this.save(fightEntity.CollectionName, fight, (err, res) => {
            next(err, fight);
        });
    };

    private getPoints(playerId: string, isVoterRegisteredUser: boolean){
        if (playerId === this.request.playerId){
            return isVoterRegisteredUser ? 2 : 1;
        }

        return isVoterRegisteredUser ? -1 : 0;
    }

    private updatePlayers = (fight: fightEntity.FightEntity, next) => {
        if (!fight){
            next(null);
            return;
        }

        var playerIds = [fight.player1Id, fight.player2Id];
        var query = {_id: {$in: playerIds}};
        var update = { $inc: {
            fights: 1
        }};

        this.update(playerEntity.CollectionName, query, update, (err, res) => {
            next(err);
        });
    };

    private getGameFight = (next) => {
        this.executeGetGameFightOperation(next);
    };

    private executeGetGameFightOperation = (next) => {
        new getGameFightOp.GetGameFightOperation(null, this.expressRequest, this.expressResponse).execute((response: IGetGameFightResponse) => {
            this.response = response;
            next(null);
        });
    };

    private incrementCurrentPlayerEnergy = (next) => {
        var userId = this.currentUserObjectId();
        if (!userId){
            next();
            return;
        }

        this.findOne(playerEntity.CollectionName, {accountId: userId}, (err, res: playerEntity.PlayerEntity) => {
            if (!err && res){
                var initialEnergy = res.energy;
                if (res.availableEnergy === undefined || res.energy === undefined){
                    res.energy = 1;
                    res.availableEnergy = 20;
                }
                else if (res.energy < res.availableEnergy) {
                    res.energy++;
                }

                if (initialEnergy !== res.energy){
                    this.save(playerEntity.CollectionName, res, (err, res) => {
                        next(err);
                    });
                    return;
                }
            }

            next(err);
        });
    };

    private respond = (err) => {
        if (err) this.response.error = err;
        this.cb(this.response);
    }
}