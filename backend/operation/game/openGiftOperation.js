var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var playerEntity = require('../../entities/playerEntity');
var OpenGiftOperation = (function (_super) {
    __extends(OpenGiftOperation, _super);
    function OpenGiftOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.getPlayer = function (next) {
            var query = new playerEntity.PlayerEntity();
            query.accountId = _this.currentUserObjectId();
            _this.mustFindOne(playerEntity.CollectionName, query, next);
        };
        this.updatePlayer = function (player, next) {
            if (!_this.hasGift(player)) {
                next();
                return;
            }
            var giftPoints = _this.getRandomBetween(1, 10);
            _this.response.points = giftPoints;
            player.points += giftPoints;
            player.giftArrivesOn = _this.getNewGiftDate();
            _this.save(playerEntity.CollectionName, player, next);
        };
        this.getNewGiftDate = function () {
            var randomHours = _this.getRandomBetween(3, 24);
            var arrivesOn = new Date();
            arrivesOn.setHours(arrivesOn.getHours() + randomHours);
            return arrivesOn;
        };
        this.respond = function (err) {
            if (err)
                _this.response.error = err;
            _this.cb(_this.response);
        };
    }
    OpenGiftOperation.prototype.execute = function (cb) {
        this.cb = cb;
        this.response = {};
        this.response.points = 0;
        this.async.waterfall([
            this.getPlayer,
            this.updatePlayer
        ], this.respond);
    };
    OpenGiftOperation.prototype.hasGift = function (player) {
        var giftArrivesOn = player.giftArrivesOn;
        var now = new Date().getTime();
        return !giftArrivesOn || new Date(giftArrivesOn.toString()).getTime() < now;
    };
    return OpenGiftOperation;
})(operation.Operation);
exports.OpenGiftOperation = OpenGiftOperation;
//# sourceMappingURL=openGiftOperation.js.map