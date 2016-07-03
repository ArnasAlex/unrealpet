var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var accountEntity = require('../../entities/accountEntity');
var postEntity = require('../../entities/postEntity');
var playerEntity = require('../../entities/playerEntity');
var GetPetPostDetailsOperation = (function (_super) {
    __extends(GetPetPostDetailsOperation, _super);
    function GetPetPostDetailsOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.details = {};
        this.getAccount = function (next) {
            _this.accountId = _this.getObjectId(_this.getOwnerId(_this.request));
            if (!_this.accountId) {
                next(2);
                return;
            }
            var query = { _id: _this.accountId };
            _this.findOne(accountEntity.CollectionName, query, function (err, res) {
                if (!err) {
                    if (res) {
                        _this.details.about = res.about;
                        _this.details.id = res._id.toString();
                        _this.details.logoUrl = res.logo;
                        _this.details.mainPictureUrl = res.picture;
                        _this.details.name = res.name;
                        _this.details.type = res.type;
                    }
                    else {
                        err = 2;
                    }
                }
                next(err);
            });
        };
        this.getPostCount = function (next) {
            var query = { ownerId: _this.accountId };
            _this.db.collection(postEntity.CollectionName).count(query, function (err, res) {
                if (!err) {
                    _this.details.posts = res;
                }
                next(err);
            });
        };
        this.getCommentCount = function (next) {
            var pipeline = [
                {
                    $match: {
                        $and: [
                            { ownerId: _this.accountId },
                            { 'comments.0': { $exists: true } }
                        ]
                    }
                },
                { $unwind: "$comments" },
                { $group: {
                        _id: null,
                        count: { $sum: 1 }
                    } }
            ];
            _this.db.collection(postEntity.CollectionName).aggregate(pipeline, function (err, res) {
                if (!err) {
                    _this.details.comments = res.length > 0 ? res[0].count : 0;
                }
                next(err);
            });
        };
        this.getPawCount = function (next) {
            var pipeline = [
                {
                    $match: {
                        $and: [
                            { ownerId: _this.accountId },
                            { 'paws.0': { $exists: true } }
                        ]
                    }
                },
                { $unwind: "$paws" },
                { $group: {
                        _id: null,
                        count: { $sum: 1 }
                    } }
            ];
            _this.db.collection(postEntity.CollectionName).aggregate(pipeline, function (err, res) {
                if (!err) {
                    _this.details.paws = res.length > 0 ? res[0].count : 0;
                }
                next(err);
            });
        };
        this.getUPPCount = function (next) {
            var pipeline = [
                {
                    $match: { ownerId: _this.accountId }
                },
                { $group: {
                        _id: null,
                        count: { $sum: '$favs' }
                    } }
            ];
            _this.db.collection(postEntity.CollectionName).aggregate(pipeline, function (err, res) {
                if (!err) {
                    _this.details.upps = res.length > 0 ? res[0].count : 0;
                }
                next(err);
            });
        };
        this.getPlayerPicture = function (next) {
            var query = { accountId: _this.getObjectId(_this.details.id) };
            _this.findOne(playerEntity.CollectionName, query, function (err, res) {
                if (res) {
                    _this.details.gamePictureUrl = res.pictureUrl;
                }
                next(err);
            });
        };
        this.respond = function (err) {
            var response = {
                error: err,
                details: err ? null : _this.details
            };
            _this.cb(response);
        };
    }
    GetPetPostDetailsOperation.prototype.execute = function (cb) {
        this.cb = cb;
        this.async.waterfall([
            this.getAccount,
            this.getPostCount,
            this.getCommentCount,
            this.getPawCount,
            this.getUPPCount,
            this.getPlayerPicture
        ], this.respond);
    };
    GetPetPostDetailsOperation.prototype.getOwnerId = function (req) {
        var result = req.id ? req.id : req.accountId;
        return result;
    };
    return GetPetPostDetailsOperation;
})(operation.Operation);
exports.GetPetPostDetailsOperation = GetPetPostDetailsOperation;
//# sourceMappingURL=getPetPostDetailsOperation.js.map