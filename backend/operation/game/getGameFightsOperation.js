var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var playerEntity = require('../../entities/playerEntity');
var accountEntity = require('../../entities/accountEntity');
var fightEntity = require('../../entities/fightEntity');
var GetGameFightsOperation = (function (_super) {
    __extends(GetGameFightsOperation, _super);
    function GetGameFightsOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.getCurrentUserPlayer = function (next) {
            var query = { accountId: _this.currentUserObjectId() };
            _this.findOne(playerEntity.CollectionName, query, function (err, res) {
                _this.currentPlayer = res;
                next(err);
            });
        };
        this.getFights = function (next) {
            if (!_this.currentPlayer) {
                next(null);
                return;
            }
            var currentUserPlayerId = _this.currentPlayer._id;
            var sort = { updatedOn: -1 };
            var query = _this.getFightQuery();
            _this.db.collection(fightEntity.CollectionName)
                .find(query)
                .sort(sort)
                .skip(_this.request.skip)
                .limit(_this.request.take)
                .toArray(function (err, res) {
                if (err) {
                    _this.logDbError(err);
                    err = _this.defaultErrorMsg();
                }
                else {
                    _this.response.list = [];
                    for (var i = 0; i < res.length; i++) {
                        _this.response.list.push(_this.map(res[i], currentUserPlayerId));
                    }
                }
                next(err);
            });
        };
        this.fillPlayerInfo = function (next) {
            if (!_this.currentPlayer) {
                next(null);
                return;
            }
            var playerIds = _this._.map(_this.response.list, function (x) { return _this.getObjectId(x.opponentPlayerId); });
            var query = { _id: { $in: playerIds } };
            _this.db.collection(playerEntity.CollectionName)
                .find(query)
                .toArray(function (err, res) {
                if (err) {
                    _this.logDbError(err);
                    err = _this.defaultErrorMsg();
                }
                else {
                    _this._.each(_this.response.list, function (fight) {
                        var player = _this._.find(res, function (x) { return x._id.toString() == fight.opponentPlayerId; });
                        fight.opponentAccountId = player.accountId.toString();
                        fight.opponentPicture = player.pictureUrl;
                    });
                    _this.players = res;
                }
                next(err);
            });
        };
        this.fillAccountInfo = function (next) {
            if (!_this.currentPlayer) {
                next(null);
                return;
            }
            var accountIds = _this._.map(_this.response.list, function (x) { return _this.getObjectId(x.opponentAccountId); });
            var query = { _id: { $in: accountIds } };
            _this.db.collection(accountEntity.CollectionName)
                .find(query)
                .toArray(function (err, res) {
                if (err) {
                    _this.logDbError(err);
                    err = _this.defaultErrorMsg();
                }
                else {
                    _this._.each(_this.response.list, function (fight) {
                        var account = _this._.find(res, function (x) { return x._id.toString() == fight.opponentAccountId; });
                        fight.opponentName = account.name;
                    });
                }
                next(err);
            });
        };
        this.fillPlaces = function (next) {
            if (!_this.currentPlayer || _this.players.length == 0) {
                next(null);
                return;
            }
            _this.async.each(_this.players, _this.getPlayerPlace, next);
        };
        this.getPlayerPlace = function (player, cb) {
            var query = { points: { $gt: player.points } };
            _this.db.collection(playerEntity.CollectionName).count(query, function (err, res) {
                if (!err) {
                    _this._.each(_this.response.list, function (fight) {
                        if (fight.opponentPlayerId === player._id.toString()) {
                            fight.opponentPlace = res + 1;
                        }
                    });
                }
                cb(err);
            });
        };
        this.getFightCount = function (next) {
            if (!_this.currentPlayer || _this.request.skip !== 0) {
                next();
                return;
            }
            var query = _this.getFightQuery();
            _this.db.collection(fightEntity.CollectionName).count(query, function (err, res) {
                _this.response.totalCount = res;
                next(err);
            });
        };
        this.getFightQuery = function () {
            return {
                $or: [
                    { player1Id: _this.currentPlayer._id },
                    { player2Id: _this.currentPlayer._id }
                ],
                winnerId: { $exists: true }
            };
        };
        this.respond = function (err) {
            if (err)
                _this.response.error = err;
            _this.cb(_this.response);
        };
    }
    GetGameFightsOperation.prototype.execute = function (cb) {
        this.cb = cb;
        this.response = {};
        this.parseSearchRequest(this.request);
        this.async.waterfall([
            this.getCurrentUserPlayer,
            this.getFights,
            this.fillPlayerInfo,
            this.fillAccountInfo,
            this.fillPlaces,
            this.getFightCount
        ], this.respond);
    };
    GetGameFightsOperation.prototype.map = function (fight, currentUserPlayerId) {
        var currentPlayerPoints = fight.player1Id.equals(currentUserPlayerId) ? fight.player1Points : fight.player2Points;
        var isWin = fight.winnerId.equals(currentUserPlayerId);
        var opponentId = fight.player1Id.equals(currentUserPlayerId)
            ? fight.player2Id.toString()
            : fight.player1Id.toString();
        var result = {
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
    };
    GetGameFightsOperation.prototype.hideFightResults = function (fight) {
        var status = fight.status;
        var isFightHidden = status === 1 || status === 2;
        if (!isFightHidden) {
            return;
        }
        fight.isWin = undefined;
        fight.points = undefined;
    };
    return GetGameFightsOperation;
})(operation.Operation);
exports.GetGameFightsOperation = GetGameFightsOperation;
//# sourceMappingURL=getGameFightsOperation.js.map