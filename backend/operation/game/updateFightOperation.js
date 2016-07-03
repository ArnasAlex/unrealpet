var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var playerEntity = require('../../entities/playerEntity');
var fightEntity = require('../../entities/fightEntity');
var UpdateFightOperation = (function (_super) {
    __extends(UpdateFightOperation, _super);
    function UpdateFightOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.getFight = function (next) {
            var query = { _id: _this.getObjectId(_this.request.id) };
            _this.mustFindOne(fightEntity.CollectionName, query, function (err, res) {
                _this.fight = res;
                next(err);
            });
        };
        this.getPlayers = function (next) {
            var players = [_this.fight.player1Id, _this.fight.player2Id];
            var query = { _id: { $in: players } };
            _this.db.collection(playerEntity.CollectionName).find(query).toArray(function (err, res) {
                _this.players = res;
                next(err);
            });
        };
        this.validate = function (next) {
            _this.currentUserPlayer = _this._.find(_this.players, function (x) { return x.accountId.toString() === _this.currentUserId(); });
            _this.opponent = _this._.find(_this.players, function (x) { return x !== _this.currentUserPlayer; });
            if (_this.fight.status !== 1) {
                next(_this.mlt.game_fight_already_playing);
                return;
            }
            var currentPlayerId = _this.currentUserPlayer._id.toString();
            if (_this.fight.player1Id.toString() !== currentPlayerId && _this.fight.player2Id.toString() !== currentPlayerId) {
                _this.logError('Trying to play not his game while updating fight.', _this.request);
                next(_this.defaultErrorMsg());
                return;
            }
            if (!_this.currentUserPlayer) {
                var msg = 'Current player not found while updating fight. Req: ' +
                    JSON.stringify(_this.request) + ' currentUser: ' + _this.currentUserId();
                _this.error(msg);
                next(_this.defaultErrorMsg());
                return;
            }
            var playerEnergy = _this.currentUserPlayer.energy;
            var skillEnergy = _this.getSkillEnergy();
            if (skillEnergy === undefined) {
                next('Skill not found');
                _this.logError('Skill not found while updating fight.', _this.request);
                return;
            }
            if (playerEnergy < skillEnergy) {
                next('Not enough energy');
                return;
            }
            next(null);
        };
        this.updateFight = function (next) {
            _this.response.originalPoints = _this.getFightPoints();
            _this.useSkill(_this.request.skill, _this.opponent, _this.currentUserPlayer);
            _this.response.modifiedPoints = _this.getFightPoints();
            if (_this.fight.player1Points > _this.fight.player2Points) {
                _this.fight.winnerId = _this.fight.player1Id;
            }
            if (_this.fight.player1Points < _this.fight.player2Points) {
                _this.fight.winnerId = _this.fight.player2Id;
            }
            _this.fight.status = 3;
            _this.save(fightEntity.CollectionName, _this.fight, function (err, res) {
                next(err);
            });
        };
        this.getSkillEnergy = function () {
            var skill = _this.request.skill;
            var energy = [];
            energy[2] = 1;
            energy[1] = 5;
            energy[3] = 4;
            energy[0] = 2;
            return energy[skill];
        };
        this.updatePlayers = function (next) {
            _this._.each(_this.players, function (player) {
                var otherPlayerPoints;
                var currentPlayerPoints;
                if (_this.fight.player1Id.toString() === player._id.toString()) {
                    currentPlayerPoints = _this.fight.player1Points;
                    otherPlayerPoints = _this.fight.player2Points;
                }
                else {
                    currentPlayerPoints = _this.fight.player2Points;
                    otherPlayerPoints = _this.fight.player1Points;
                }
                player.points += currentPlayerPoints;
                var isPlayerWinner = currentPlayerPoints > otherPlayerPoints
                    || (currentPlayerPoints === otherPlayerPoints && player._id.toString() == _this.fight.winnerId.toString());
                if (player._id.toString() === _this.currentUserPlayer._id.toString()) {
                    _this.response.isWinner = isPlayerWinner;
                }
                if (isPlayerWinner) {
                    player.win++;
                }
                else {
                    player.defeat++;
                }
            });
            _this.updatePlayerEnergy();
            _this.async.map(_this.players, function (player, cb) {
                _this.save(playerEntity.CollectionName, player, cb);
            }, function (err) { next(err); });
        };
        this.useSkill = function (skill, opponent, player) {
            if (skill === 0) {
                var points = _this.fight.player1Points;
                _this.fight.player1Points = _this.fight.player2Points;
                _this.fight.player2Points = points;
            }
            if (skill === 1) {
                var damage = _this.getRandomBetween(4, 8);
                if (_this.fight.player1Id.toString() === player._id.toString()) {
                    _this.fight.player2Points -= damage;
                }
                else {
                    _this.fight.player1Points -= damage;
                }
            }
            if (skill === 3) {
                var points = _this.getRandomBetween(0, 1);
                _this.fight.player1Points *= 2;
                _this.fight.player1Points = _this.increaseNumberIgnoringSign(_this.fight.player1Points, points);
                _this.fight.player2Points *= 2;
                _this.fight.player2Points = _this.increaseNumberIgnoringSign(_this.fight.player2Points, points);
            }
            if (skill === 2) {
                var isPlayerWinner = player._id.toString() === _this.fight.winnerId.toString();
                var points = _this.getRandomBetween(1, 2);
                if (isPlayerWinner === _this.request.guessingSelf) {
                    if (_this.fight.player1Id.toString() === player._id.toString()) {
                        _this.fight.player1Points += points;
                    }
                    else {
                        _this.fight.player2Points += points;
                    }
                }
            }
        };
        this.respond = function (err) {
            if (err)
                _this.response.error = err;
            _this.cb(_this.response);
        };
    }
    UpdateFightOperation.prototype.execute = function (cb) {
        this.cb = cb;
        this.response = {};
        this.async.waterfall([
            this.getFight,
            this.getPlayers,
            this.validate,
            this.updateFight,
            this.updatePlayers
        ], this.respond);
    };
    UpdateFightOperation.prototype.getFightPoints = function () {
        return {
            opponent: this.fight.player1Id.toString() === this.opponent._id.toString()
                ? this.fight.player1Points
                : this.fight.player2Points,
            player: this.fight.player1Id.toString() === this.currentUserPlayer._id.toString()
                ? this.fight.player1Points
                : this.fight.player2Points
        };
    };
    UpdateFightOperation.prototype.updatePlayerEnergy = function () {
        var skillEnergy = this.getSkillEnergy();
        this.currentUserPlayer.energy -= skillEnergy;
        this.currentUserPlayer.availableEnergy -= skillEnergy;
        if (this.currentUserPlayer.energy < 0) {
            this.currentUserPlayer.energy = 0;
        }
        if (this.currentUserPlayer.availableEnergy < 1) {
            this.currentUserPlayer.availableEnergy = 1;
        }
        this.response.energy = this.currentUserPlayer.energy;
    };
    UpdateFightOperation.prototype.increaseNumberIgnoringSign = function (num, increment) {
        if (num > 0) {
            num += increment;
        }
        else {
            num -= increment;
        }
        return num;
    };
    return UpdateFightOperation;
})(operation.Operation);
exports.UpdateFightOperation = UpdateFightOperation;
//# sourceMappingURL=updateFightOperation.js.map