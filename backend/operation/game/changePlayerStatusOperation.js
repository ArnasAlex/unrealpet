var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var playerEntity = require('../../entities/playerEntity');
var ChangePlayerStatusOperation = (function (_super) {
    __extends(ChangePlayerStatusOperation, _super);
    function ChangePlayerStatusOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.getPlayer = function (next) {
            var query = new playerEntity.PlayerEntity();
            query.accountId = _this.currentUserObjectId();
            _this.mustFindOne(playerEntity.CollectionName, query, next);
        };
        this.changeStatus = function (player, next) {
            player.status = _this.request.status;
            _this.save(playerEntity.CollectionName, player, next);
        };
        this.respond = function (err) {
            if (err)
                _this.response.error = err;
            _this.cb(_this.response);
        };
    }
    ChangePlayerStatusOperation.prototype.execute = function (cb) {
        this.cb = cb;
        this.response = {};
        this.async.waterfall([
            this.getPlayer,
            this.changeStatus
        ], this.respond);
    };
    return ChangePlayerStatusOperation;
})(operation.Operation);
exports.ChangePlayerStatusOperation = ChangePlayerStatusOperation;
//# sourceMappingURL=changePlayerStatusOperation.js.map