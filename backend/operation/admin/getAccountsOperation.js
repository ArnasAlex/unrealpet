var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var accountEntity = require('../../entities/accountEntity');
var connectionEntity = require('../../entities/connectionEntity');
var accHelper = require('../login/accountHelper');
var GetAccountsOperation = (function (_super) {
    __extends(GetAccountsOperation, _super);
    function GetAccountsOperation() {
        _super.apply(this, arguments);
    }
    GetAccountsOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.getAccounts.bind(this),
            this.getLastActivity.bind(this),
            this.map.bind(this)
        ], this.respond.bind(this, cb));
    };
    GetAccountsOperation.prototype.getAccounts = function (next) {
        var _this = this;
        var filter = this.getFilter();
        var skip = this.getNumberFromGetRequest(this.request.skip);
        var sort = this.getSort();
        this.db.collection(accountEntity.CollectionName)
            .find(filter)
            .sort(sort)
            .skip(skip)
            .limit(this.getNumberFromGetRequest(this.request.take))
            .toArray(function (err, res) {
            if (err) {
                _this.logDbError(err);
                err = _this.defaultErrorMsg();
                next(err);
            }
            else {
                if (skip === 0) {
                    _this.getTotalCount(filter, res, next);
                }
                else {
                    next(err, res, null);
                }
            }
        });
    };
    GetAccountsOperation.prototype.getTotalCount = function (filter, res, next) {
        this.db.collection(accountEntity.CollectionName).find(filter).count(false, function (err, count) {
            next(err, res, count);
        });
    };
    GetAccountsOperation.prototype.getLastActivity = function (accounts, count, next) {
        var aggregation = this.getAggregation(accounts);
        this.db.collection(connectionEntity.CollectionName).aggregate(aggregation, function (err, res) {
            next(err, accounts, res, count);
        });
    };
    GetAccountsOperation.prototype.getAggregation = function (accounts) {
        var accIds = this._.map(accounts, function (acc) { return acc._id; });
        var result = [
            {
                $match: {
                    accountId: { $in: accIds }
                }
            },
            {
                $group: {
                    _id: "$accountId",
                    lastActivityOn: { $max: "$createdOn" }
                }
            }
        ];
        return result;
    };
    GetAccountsOperation.prototype.getFilter = function () {
        var result = {};
        var filter = this.request.filter;
        if (filter && filter.length > 0) {
            result = {
                $or: [
                    { email: new RegExp(filter, 'i') },
                    { name: new RegExp(filter, 'i') }
                ]
            };
        }
        return result;
    };
    GetAccountsOperation.prototype.getSort = function () {
        var sort = this.request.sort;
        if (sort) {
            var property = Object.keys(sort)[0];
            var val = sort[property];
            sort[property] = this.getNumberFromGetRequest(val);
        }
        else {
            sort = { createdOn: -1 };
        }
        return sort;
    };
    GetAccountsOperation.prototype.map = function (accounts, lastActivities, totalCount, next) {
        var _this = this;
        var result = this._.map(accounts, function (acc) {
            return {
                id: acc._id.toString(),
                name: acc.name,
                email: acc.email,
                createdOn: acc.createdOn,
                lastActivityOn: _this.getLastActivityByForAccount(acc._id, lastActivities),
                loginProvider: accHelper.Helper.getLoginProvider(acc),
                master: acc.master ? acc.master.name : null
            };
        });
        next(null, result, totalCount);
    };
    GetAccountsOperation.prototype.getLastActivityByForAccount = function (accId, activities) {
        var activity = this._.find(activities, function (x) { return x._id.toString() === accId.toString(); });
        return activity ? activity.lastActivityOn : null;
    };
    GetAccountsOperation.prototype.respond = function (cb, err, connections, totalCount) {
        var response = {
            error: err,
            list: connections,
            totalCount: this.getNumberFromGetRequest(this.request.skip) === 0 ? totalCount : undefined
        };
        cb(response);
    };
    return GetAccountsOperation;
})(operation.Operation);
exports.GetAccountsOperation = GetAccountsOperation;
//# sourceMappingURL=getAccountsOperation.js.map