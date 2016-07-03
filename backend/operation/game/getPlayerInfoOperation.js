var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var playerEntity = require('../../entities/playerEntity');
var updateGameEnergyOperation = require('./updatePlayerEnergyOperation');
var GetPlayerInfoOperation = (function (_super) {
    __extends(GetPlayerInfoOperation, _super);
    function GetPlayerInfoOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.getPlayer = function (next) {
            var query = new playerEntity.PlayerEntity();
            query.accountId = _this.currentUserObjectId();
            _this.findOne(playerEntity.CollectionName, query, function (err, player) {
                if (!err && player) {
                    var req = {
                        player: player
                    };
                    _this.executeUpdateEnergyOperation(req, function (res) {
                        var saveErr = res.error;
                        if (saveErr) {
                            next(saveErr);
                            return;
                        }
                        _this.response.pictureUrl = player.pictureUrl;
                        _this.response.defeats = player.defeat;
                        _this.response.wins = player.win;
                        _this.response.fights = player.fights;
                        _this.response.points = player.points;
                        _this.response.status = player.status;
                        _this.response.energy = player.energy;
                        _this.response.isRegistered = true;
                        _this.response.hasGift = _this.hasGift(player);
                        next();
                    });
                    return;
                }
                next(err);
            });
        };
        this.executeUpdateEnergyOperation = function (req, cb) {
            new updateGameEnergyOperation.UpdatePlayerEnergyOperation(req).execute(cb);
        };
        this.getPlayerCount = function (next) {
            _this.db.collection(playerEntity.CollectionName).count({}, function (err, res) {
                if (!err) {
                    _this.response.totalPlayers = res;
                }
                next(err);
            });
        };
        this.getPlace = function (next) {
            if (!_this.response.isRegistered) {
                next();
                return;
            }
            var query = {
                points: { $gt: _this.response.points }
            };
            _this.db.collection(playerEntity.CollectionName).count(query, function (err, res) {
                if (!err) {
                    _this.response.place = res + 1;
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
    GetPlayerInfoOperation.prototype.execute = function (cb) {
        this.cb = cb;
        this.response = {};
        this.async.waterfall([
            this.getPlayer,
            this.getPlayerCount,
            this.getPlace
        ], this.respond);
    };
    GetPlayerInfoOperation.prototype.hasGift = function (player) {
        var giftArrivesOn = player.giftArrivesOn;
        var now = new Date().getTime();
        return !giftArrivesOn || new Date(giftArrivesOn.toString()).getTime() < now;
    };
    return GetPlayerInfoOperation;
})(operation.Operation);
exports.GetPlayerInfoOperation = GetPlayerInfoOperation;
//# sourceMappingURL=getPlayerInfoOperation.js.map