/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import getGameFightOp = require('./getGameFightOperation');
import playerEntity = require('../../entities/playerEntity');
import fightEntity = require('../../entities/fightEntity');
import mdb = require('mongodb');

export class UpdateFightOperation extends operation.Operation {
    protected request: IUpdateFightRequest;
    private cb: (response: IUpdateFightResponse) => void;
    private response: IUpdateFightResponse;
    private fight: fightEntity.FightEntity;
    private players: playerEntity.PlayerEntity[];
    private currentUserPlayer: playerEntity.PlayerEntity;
    private opponent: playerEntity.PlayerEntity;

    public execute(cb: (response: IUpdateFightResponse) => void) {
        this.cb = cb;
        this.response = <any>{};

        this.async.waterfall([
                this.getFight,
                this.getPlayers,
                this.validate,
                this.updateFight,
                this.updatePlayers
            ],
            this.respond);
    }

    private getFight = (next) => {
        var query: any = {_id: this.getObjectId(this.request.id)};
        this.mustFindOne(fightEntity.CollectionName, query, (err, res) => {
            this.fight = res;
            next(err);
        });
    };

    private getPlayers = (next) => {
        var players = [this.fight.player1Id, this.fight.player2Id];
        var query: any = {_id: {$in: players}};
        this.db.collection(playerEntity.CollectionName).find(query).toArray((err, res) => {
            this.players = res;
            next(err);
        });
    };

    private validate = (next) => {
        this.currentUserPlayer = this._.find(this.players, x => x.accountId.toString() === this.currentUserId());
        this.opponent = this._.find(this.players, x => x !== this.currentUserPlayer);

        if (this.fight.status !== FightStatus.Initial){
            next(this.mlt.game_fight_already_playing);
            return;
        }

        var currentPlayerId = this.currentUserPlayer._id.toString();
        if (this.fight.player1Id.toString() !== currentPlayerId && this.fight.player2Id.toString() !== currentPlayerId){
            this.logError('Trying to play not his game while updating fight.', this.request);
            next(this.defaultErrorMsg());
            return;
        }

        if (!this.currentUserPlayer){
            var msg = 'Current player not found while updating fight. Req: ' +
                JSON.stringify(this.request) + ' currentUser: ' + this.currentUserId();
            this.error(msg);
            next(this.defaultErrorMsg());
            return;
        }

        var playerEnergy = this.currentUserPlayer.energy;
        var skillEnergy = this.getSkillEnergy();
        if (skillEnergy === undefined){
            next('Skill not found');
            this.logError('Skill not found while updating fight.', this.request);
            return;
        }

        if (playerEnergy < skillEnergy){
            next('Not enough energy');
            return;
        }

        next(null);
    };

    private updateFight = (next) => {
        this.response.originalPoints = this.getFightPoints();
        this.useSkill(this.request.skill, this.opponent, this.currentUserPlayer);
        this.response.modifiedPoints = this.getFightPoints();
        if (this.fight.player1Points > this.fight.player2Points){
            this.fight.winnerId = this.fight.player1Id;
        }

        if (this.fight.player1Points < this.fight.player2Points){
            this.fight.winnerId = this.fight.player2Id;
        }

        this.fight.status = FightStatus.Over;
        this.save(fightEntity.CollectionName, this.fight, (err, res) => {
            next(err);
        });
    };

    private getFightPoints(): IFightPoints {
        return {
            opponent: this.fight.player1Id.toString() === this.opponent._id.toString()
                ? this.fight.player1Points
                : this.fight.player2Points,
            player: this.fight.player1Id.toString() === this.currentUserPlayer._id.toString()
                ? this.fight.player1Points
                : this.fight.player2Points
        };
    }

    private getSkillEnergy = () => {
        var skill = this.request.skill;

        var energy = [];
        energy[VoteResultControlSkill.GuessWinner] = 1;
        energy[VoteResultControlSkill.Bomb] = 5;
        energy[VoteResultControlSkill.DoublePoints] = 4;
        energy[VoteResultControlSkill.TurnAround] = 2;

        return energy[skill];
    };

    private updatePlayers = (next) => {
        this._.each(this.players, (player: playerEntity.PlayerEntity) => {
            var otherPlayerPoints;
            var currentPlayerPoints;
            if (this.fight.player1Id.toString() === player._id.toString()){
                currentPlayerPoints = this.fight.player1Points;
                otherPlayerPoints = this.fight.player2Points;
            }
            else{
                currentPlayerPoints = this.fight.player2Points;
                otherPlayerPoints = this.fight.player1Points;
            }

            player.points += currentPlayerPoints;
            var isPlayerWinner = currentPlayerPoints > otherPlayerPoints
                || (currentPlayerPoints === otherPlayerPoints && player._id.toString() == this.fight.winnerId.toString());

            if (player._id.toString() === this.currentUserPlayer._id.toString()){
                this.response.isWinner = isPlayerWinner;
            }

            if (isPlayerWinner) {
                player.win++;
            }
            else{
                player.defeat++;
            }
        });

        this.updatePlayerEnergy();
        this.async.map(this.players, (player, cb: any) => {
            this.save(playerEntity.CollectionName, player, cb);
        }, (err) => { next(err);});
    };

    private updatePlayerEnergy(){
        var skillEnergy = this.getSkillEnergy();
        this.currentUserPlayer.energy -= skillEnergy;
        this.currentUserPlayer.availableEnergy -= skillEnergy;
        if (this.currentUserPlayer.energy < 0){
            this.currentUserPlayer.energy = 0;
        }

        if (this.currentUserPlayer.availableEnergy < 1){
            this.currentUserPlayer.availableEnergy = 1;
        }

        this.response.energy = this.currentUserPlayer.energy;
    }

    private useSkill = (skill: VoteResultControlSkill, opponent: playerEntity.PlayerEntity, player: playerEntity.PlayerEntity) => {
        if (skill === VoteResultControlSkill.TurnAround) {
            var points = this.fight.player1Points;
            this.fight.player1Points = this.fight.player2Points;
            this.fight.player2Points = points;
        }

        if (skill === VoteResultControlSkill.Bomb){
            var damage = this.getRandomBetween(4, 8);
            if (this.fight.player1Id.toString() === player._id.toString()){
                this.fight.player2Points -= damage;
            }
            else{
                this.fight.player1Points -= damage;
            }
        }

        if (skill === VoteResultControlSkill.DoublePoints){
            var points = this.getRandomBetween(0, 1);
            this.fight.player1Points *= 2;
            this.fight.player1Points = this.increaseNumberIgnoringSign(this.fight.player1Points, points);

            this.fight.player2Points *= 2;
            this.fight.player2Points = this.increaseNumberIgnoringSign(this.fight.player2Points, points);
        }

        if (skill === VoteResultControlSkill.GuessWinner){
            var isPlayerWinner = player._id.toString() === this.fight.winnerId.toString();
            var points = this.getRandomBetween(1, 2);
            if (isPlayerWinner === this.request.guessingSelf){
                if (this.fight.player1Id.toString() === player._id.toString()){
                    this.fight.player1Points += points;
                }
                else{
                    this.fight.player2Points += points;
                }
            }
        }
    };

    private increaseNumberIgnoringSign(num: number, increment: number){
        if (num > 0){
            num += increment;
        }
        else{
            num -= increment;
        }

        return num;
    }

    private respond = (err) => {
        if (err) this.response.error = err;
        this.cb(this.response);
    }
}