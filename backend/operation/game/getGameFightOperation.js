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
var GetGameFightOperation = (function (_super) {
    __extends(GetGameFightOperation, _super);
    function GetGameFightOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.getPlayers = function (next) {
            var query = {};
            if (_this.currentUserObjectId()) {
                query.accountId = { $not: { $eq: _this.currentUserObjectId() } };
            }
            query.status = 1;
            var sort = { lastFightOn: 1 };
            _this.db.collection(playerEntity.CollectionName).find(query).sort(sort).limit(10).toArray(function (err, res) {
                if (err) {
                    _this.logDbError(err);
                    err = _this.defaultErrorMsg();
                }
                next(err, res);
            });
        };
        this.choosePlayers = function (players, next) {
            if (players.length >= 2) {
                _this.response.players = [];
                var player1 = _this.getRandomPlayer(players);
                _this.response.players.push(_this.mapPlayer(player1));
                var player2 = _this.getRandomPlayer(players);
                _this.response.players.push(_this.mapPlayer(player2));
                players = [player1, player2];
            }
            next(null, players);
        };
        this.getPlayersPlace = function (players, next) {
            if (!_this.response.players) {
                next(null);
                return;
            }
            _this.async.each(players, _this.getPlayerPlace, next);
        };
        this.getPlayerPlace = function (player, cb) {
            var query = { points: { $gt: player.points } };
            _this.db.collection(playerEntity.CollectionName).count(query, function (err, res) {
                if (!err) {
                    var responsePlayer = _this._.find(_this.response.players, function (x) { return x.id === player._id.toString(); });
                    responsePlayer.place = res + 1;
                }
                cb(err);
            });
        };
        this.createFight = function (next) {
            if (!_this.response.players) {
                next(null);
                return;
            }
            var fight = new fightEntity.FightEntity();
            fight._id = _this.getId();
            fight.player1Id = _this.getObjectId(_this.response.players[0].id);
            fight.player2Id = _this.getObjectId(_this.response.players[1].id);
            var voterId = _this.currentUserObjectId();
            if (voterId) {
                fight.voterId = voterId;
            }
            else {
                fight.voterIp = _this.currentUserIp();
            }
            _this.response.id = fight._id.toString();
            _this.save(fightEntity.CollectionName, fight, function (err, res) { next(err); });
        };
        this.updatePlayers = function (next) {
            if (!_this.response.players) {
                next(null);
                return;
            }
            var ids = _this._.map(_this.response.players, function (x) { return _this.getObjectId(x.id); });
            var query = { _id: { $in: ids } };
            _this.update(playerEntity.CollectionName, query, { $set: { lastFightOn: new Date() } }, next);
        };
        this.respond = function (err) {
            if (err)
                _this.response.error = err;
            _this.cb(_this.response);
        };
    }
    GetGameFightOperation.prototype.execute = function (cb) {
        this.cb = cb;
        this.response = {};
        this.async.waterfall([
            this.getPlayers,
            this.choosePlayers,
            this.getPlayersPlace,
            this.createFight,
            this.updatePlayers
        ], this.respond);
    };
    GetGameFightOperation.prototype.mapPlayer = function (player) {
        var mappedPlayer = {
            id: player._id.toString(),
            picture: player.pictureUrl,
            place: null
        };
        return mappedPlayer;
    };
    GetGameFightOperation.prototype.getRandomPlayer = function (players) {
        var randomNr = Math.floor(Math.random() * players.length);
        var player = players[randomNr];
        players.splice(randomNr, 1);
        return player;
    };
    return GetGameFightOperation;
})(operation.Operation);
exports.GetGameFightOperation = GetGameFightOperation;
//# sourceMappingURL=getGameFightOperation.js.map