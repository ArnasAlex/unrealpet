var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var playerEntity = require('../../entities/playerEntity');
var updateEnergyOp = require('./updatePlayerEnergyOperation');
var GetPlayerEnergyOperation = (function (_super) {
    __extends(GetPlayerEnergyOperation, _super);
    function GetPlayerEnergyOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.getPlayer = function (next) {
            var query = { accountId: _this.currentUserObjectId() };
            _this.findOne(playerEntity.CollectionName, query, function (err, res) {
                _this.player = res;
                next(err);
            });
        };
        this.updateEnergy = function (next) {
            if (!_this.player) {
                _this.response.availableEnergy = playerEntity.PlayerEntity.maxEnergy;
                _this.response.energy = 0;
                next();
                return;
            }
            var req = {
                player: _this.player
            };
            _this.executeUpdateEnergyOperation(req, function (res) {
                _this.response.availableEnergy = _this.player.availableEnergy;
                _this.response.energy = _this.player.energy;
                next(res.error);
            });
        };
        this.executeUpdateEnergyOperation = function (req, cb) {
            var op = new updateEnergyOp.UpdatePlayerEnergyOperation(req);
            op.execute(cb);
        };
        this.respond = function (err) {
            if (err)
                _this.response.error = err;
            _this.cb(_this.response);
        };
    }
    GetPlayerEnergyOperation.prototype.execute = function (cb) {
        this.cb = cb;
        this.response = {};
        this.async.waterfall([
            this.getPlayer,
            this.updateEnergy
        ], this.respond);
    };
    return GetPlayerEnergyOperation;
})(operation.Operation);
exports.GetPlayerEnergyOperation = GetPlayerEnergyOperation;
//# sourceMappingURL=getPlayerEnergyOperation.js.map