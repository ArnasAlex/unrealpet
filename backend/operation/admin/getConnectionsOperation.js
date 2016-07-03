var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var connectionEntity = require('../../entities/connectionEntity');
var GetConnectionsOperation = (function (_super) {
    __extends(GetConnectionsOperation, _super);
    function GetConnectionsOperation() {
        _super.apply(this, arguments);
    }
    GetConnectionsOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.getConnections.bind(this),
            this.map.bind(this)
        ], this.respond.bind(this, cb));
    };
    GetConnectionsOperation.prototype.getConnections = function (next) {
        var _this = this;
        var filter = this.getFilter();
        var skip = this.getNumberFromGetRequest(this.request.skip);
        this.db.collection(connectionEntity.CollectionName)
            .find(filter)
            .sort({ createdOn: -1 })
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
    GetConnectionsOperation.prototype.getTotalCount = function (filter, res, next) {
        this.db.collection(connectionEntity.CollectionName).find(filter).count(false, function (err, count) {
            next(err, res, count);
        });
    };
    GetConnectionsOperation.prototype.getFilter = function () {
        var result = {};
        var filter = this.request.filter;
        if (filter && filter.length > 0) {
            result = {
                $or: [
                    { ip: new RegExp(filter, 'i') },
                    { action: new RegExp(filter, 'i') },
                    { accountName: new RegExp(filter, 'i') }
                ]
            };
        }
        return result;
    };
    GetConnectionsOperation.prototype.map = function (connections, totalCount, next) {
        var result = [];
        for (var i = 0; i < connections.length; i++) {
            var con = connections[i];
            var connection = {
                id: con._id.toString(),
                accountName: con.accountName,
                ip: con.ip,
                date: con.createdOn,
                action: con.action
            };
            result.push(connection);
        }
        next(null, result, totalCount);
    };
    GetConnectionsOperation.prototype.respond = function (cb, err, connections, totalCount) {
        var response = {
            error: err,
            list: connections,
            totalCount: this.getNumberFromGetRequest(this.request.skip) === 0 ? totalCount : undefined
        };
        cb(response);
    };
    return GetConnectionsOperation;
})(operation.Operation);
exports.GetConnectionsOperation = GetConnectionsOperation;
//# sourceMappingURL=getConnectionsOperation.js.map