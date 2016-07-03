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
var GetGameLeadersOperation = (function (_super) {
    __extends(GetGameLeadersOperation, _super);
    function GetGameLeadersOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.getPlayers = function (next) {
            var sort = { points: -1 };
            _this.db.collection(playerEntity.CollectionName)
                .find({})
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
                        _this.response.list.push(_this.map(res[i], i));
                    }
                }
                next(err);
            });
        };
        this.map = function (player, nr) {
            var place = _this.request.skip + nr + 1;
            var result = {
                id: player._id.toString(),
                accountId: player.accountId.toString(),
                place: place,
                name: null,
                picture: null,
                points: player.points,
                type: null
            };
            return result;
        };
        this.getCount = function (next) {
            if (_this.request.skip !== 0) {
                next(null);
                return;
            }
            _this.db.collection(playerEntity.CollectionName).count({}, function (err, res) {
                if (err) {
                    _this.logDbError(err);
                    err = _this.defaultErrorMsg();
                }
                else {
                    _this.response.totalCount = res;
                }
                next(err);
            });
        };
        this.getAccounts = function (next) {
            var ids = _this._.map(_this.response.list, function (x) { return _this.getObjectId(x.accountId); });
            var query = {
                _id: { $in: ids }
            };
            _this.db.collection(accountEntity.CollectionName).find(query).toArray(function (err, res) {
                if (err) {
                    _this.logDbError(err);
                    err = _this.defaultErrorMsg();
                }
                else {
                    _this._.each(_this.response.list, function (leader) {
                        var acc = _this._.find(res, function (x) { return x._id.toString() === leader.accountId; });
                        if (acc) {
                            leader.name = acc.name;
                            leader.picture = acc.logo;
                            leader.type = acc.type;
                        }
                    });
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
    GetGameLeadersOperation.prototype.execute = function (cb) {
        this.cb = cb;
        this.response = {};
        this.parseSearchRequest(this.request);
        this.async.waterfall([
            this.getPlayers,
            this.getCount,
            this.getAccounts
        ], this.respond);
    };
    return GetGameLeadersOperation;
})(operation.Operation);
exports.GetGameLeadersOperation = GetGameLeadersOperation;
//# sourceMappingURL=getGameLeadersOperation.js.map