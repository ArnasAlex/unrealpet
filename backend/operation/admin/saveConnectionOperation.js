/// <reference path="../../typings/refs.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var operation = require('../base/operation');
var connectionEntity = require('../../entities/connectionEntity');
var SaveConnectionOperation = (function (_super) {
    __extends(SaveConnectionOperation, _super);
    function SaveConnectionOperation() {
        _super.apply(this, arguments);
    }
    SaveConnectionOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.saveConnection.bind(this)
        ], this.respond.bind(this, cb));
    };
    SaveConnectionOperation.prototype.saveConnection = function (next) {
        var connection = this.mapRequestToEntity(this.request);
        this.saveNonAuditable(connectionEntity.CollectionName, connection, next);
    };
    SaveConnectionOperation.prototype.mapRequestToEntity = function (request) {
        var connection = new connectionEntity.ConnectionEntity();
        if (request.accountId) {
            connection.accountId = this.getObjectId(request.accountId);
        }
        if (request.accountName) {
            connection.accountName = request.accountName;
        }
        connection.action = request.action;
        connection.ip = request.ip;
        connection.request = request.request;
        connection.createdOn = new Date();
        return connection;
    };
    SaveConnectionOperation.prototype.respond = function (cb, err) {
        var response = { error: err };
        cb(response);
    };
    return SaveConnectionOperation;
})(operation.Operation);
exports.SaveConnectionOperation = SaveConnectionOperation;
//# sourceMappingURL=saveConnectionOperation.js.map