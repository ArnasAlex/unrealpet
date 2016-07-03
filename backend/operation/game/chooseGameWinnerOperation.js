var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var getGameFightOp = require('./getGameFightOperation');
var playerEntity = require('../../entities/playerEntity');
var fightEntity = require('../../entities/fightEntity');
var ChooseGameWinnerOperation = (function (_super) {
    __extends(ChooseGameWinnerOperation, _super);
    function ChooseGameWinnerOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.getFight = function (next) {
            var query = { _id: _this.getObjectId(_this.request.fightId) };
            _this.mustFindOne(fightEntity.CollectionName, query, next);
        };
        this.validate = function (fight, next) {
            if (fight.winnerId) {
                next(null, null);
                return;
            }
            var winnerId = _this.request.playerId;
            if (fight.player1Id.toString() !== winnerId && fight.player2Id.toString() !== winnerId) {
                _this.logError('Trying to choose winner which does not belong to fight. Fight Id: ' + _this.request.fightId
                    + ' winnerId: ' + winnerId, 1);
                next(null, null);
                return;
            }
            var currentUserId = _this.currentUserObjectId();
            var currentUserIp = _this.currentUserIp();
            var isRegisteredVoter = currentUserId && fight.voterId && fight.voterId.toString() === currentUserId.toString();
            var isNotRegisteredVoter = fight.voterIp === currentUserIp;
            if (!isRegisteredVoter && !isNotRegisteredVoter) {
                _this.logError('Trying to vote for fight which does not belong to voter. Fight Id: ' + _this.request.fightId
                    + ' currentUserIp: ' + currentUserIp + ' currentUserId: ' + currentUserId, 1);
                next(null, null);
                return;
            }
            next(null, fight);
        };
        this.saveFight = function (fight, next) {
            if (!fight) {
                next(null, null);
                return;
            }
            var isVoterRegisteredUser = !!fight.voterId;
            fight.player1Points = _this.getPoints(fight.player1Id.toString(), isVoterRegisteredUser);
            fight.player2Points = _this.getPoints(fight.player2Id.toString(), isVoterRegisteredUser);
            fight.winnerId = _this.getObjectId(_this.request.playerId);
            fight.status = 1;
            _this.save(fightEntity.CollectionName, fight, function (err, res) {
                next(err, fight);
            });
        };
        this.updatePlayers = function (fight, next) {
            if (!fight) {
                next(null);
                return;
            }
            var playerIds = [fight.player1Id, fight.player2Id];
            var query = { _id: { $in: playerIds } };
            var update = { $inc: {
                    fights: 1
                } };
            _this.update(playerEntity.CollectionName, query, update, function (err, res) {
                next(err);
            });
        };
        this.getGameFight = function (next) {
            _this.executeGetGameFightOperation(next);
        };
        this.executeGetGameFightOperation = function (next) {
            new getGameFightOp.GetGameFightOperation(null, _this.expressRequest, _this.expressResponse).execute(function (response) {
                _this.response = response;
                next(null);
            });
        };
        this.incrementCurrentPlayerEnergy = function (next) {
            var userId = _this.currentUserObjectId();
            if (!userId) {
                next();
                return;
            }
            _this.findOne(playerEntity.CollectionName, { accountId: userId }, function (err, res) {
                if (!err && res) {
                    var initialEnergy = res.energy;
                    if (res.availableEnergy === undefined || res.energy === undefined) {
                        res.energy = 1;
                        res.availableEnergy = 20;
                    }
                    else if (res.energy < res.availableEnergy) {
                        res.energy++;
                    }
                    if (initialEnergy !== res.energy) {
                        _this.save(playerEntity.CollectionName, res, function (err, res) {
                            next(err);
                        });
                        return;
                    }
                }
                next(err);
            });
        };
        this.respond = function (err) {
            if (err)
                _this.response.error = err;
            _this.cb(_this.response);
        };
    }
    ChooseGameWinnerOperation.prototype.execute = function (cb) {
        this.cb = cb;
        this.response = {};
        this.async.waterfall([
            this.getFight,
            this.validate,
            this.saveFight,
            this.updatePlayers,
            this.getGameFight,
            this.incrementCurrentPlayerEnergy
        ], this.respond);
    };
    ChooseGameWinnerOperation.prototype.getPoints = function (playerId, isVoterRegisteredUser) {
        if (playerId === this.request.playerId) {
            return isVoterRegisteredUser ? 2 : 1;
        }
        return isVoterRegisteredUser ? -1 : 0;
    };
    return ChooseGameWinnerOperation;
})(operation.Operation);
exports.ChooseGameWinnerOperation = ChooseGameWinnerOperation;
//# sourceMappingURL=chooseGameWinnerOperation.js.map