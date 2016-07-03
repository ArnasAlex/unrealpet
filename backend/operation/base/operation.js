/// <reference path="../../typings/refs.d.ts" />
var mongodb = require('mongodb');
var async = require('async');
var db = require('../../core/database');
var logger = require('../../core/logger');
var multiLang = require('../../core/multilang/mltProvider');
var lodash = require('lodash');
var Operation = (function () {
    function Operation(request, req, res) {
        this.async = async;
        this._ = lodash;
        var database = db.Database.getInstance();
        this.db = database.db;
        this.request = request;
        this.mlt = multiLang.MultilangProvider.multilangIds;
        if (req) {
            this.extractRequest(req);
            this.expressRequest = req;
            this.expressResponse = res;
        }
    }
    Operation.prototype.extractRequest = function (req) {
        var payload;
        if (req.method === 'POST') {
            payload = req.body;
        }
        else {
            payload = req.query;
        }
        if (req.user && req.user.id) {
            payload.accountId = req.user.id;
        }
        this.request = payload;
        this.currentUser = req.user;
    };
    Operation.prototype.execute = function (responeCallback) {
        throw Error("Override execute() method.");
    };
    Operation.prototype.getId = function () {
        return new mongodb.ObjectID();
    };
    Operation.prototype.getObjectId = function (id) {
        if (Operation.objectIdRegex.test(id)) {
            return new mongodb.ObjectID(id);
        }
        return null;
    };
    Operation.prototype.error = function (message) {
        throw Error(message);
    };
    Operation.prototype.logError = function (message, request, type) {
        var userId = this.currentUserId();
        if (!userId) {
            userId = 'unauthenticated';
        }
        message += ' user: ' + userId;
        if (request) {
            message += ' request: ' + JSON.stringify(request);
        }
        logger.Logger.logError(message, type);
    };
    Operation.prototype.logDbError = function (message, collectionName) {
        if (collectionName === void 0) { collectionName = ''; }
        var result = 'Error on mongo db';
        if (collectionName) {
            result += ' (' + collectionName + ')';
        }
        result += ': ' + message;
        logger.Logger.logError(result);
    };
    Operation.prototype.defaultErrorMsg = function () {
        return this.mlt.server_error_default;
    };
    Operation.prototype.mustFindOne = function (collection, query, cb) {
        var _this = this;
        this.db.collection(collection).findOne(query, function (err, res) {
            if (err) {
                _this.logDbError(err);
                err = _this.defaultErrorMsg();
            }
            else if (!res) {
                var msg = 'Failed to get record from database which must exist. Query: ' + JSON.stringify(query);
                _this.logDbError(msg, collection);
                err = _this.defaultErrorMsg();
            }
            cb(err, res);
        });
    };
    Operation.prototype.findOne = function (collection, query, cb) {
        var _this = this;
        this.db.collection(collection).findOne(query, function (err, res) {
            if (err) {
                _this.logDbError(err);
                err = _this.defaultErrorMsg();
            }
            cb(err, res);
        });
    };
    Operation.prototype.remove = function (collection, query, cb) {
        var _this = this;
        this.db.collection(collection).remove(query, function (err, res) {
            if (err) {
                _this.logDbError(err);
                err = _this.defaultErrorMsg();
            }
            cb(err, res);
        });
    };
    Operation.prototype.save = function (collection, obj, cb) {
        if (!obj._id) {
            obj._id = this.getId();
        }
        if (!obj.createdOn) {
            obj.createdOn = new Date();
        }
        obj.updatedOn = new Date();
        this.saveNonAuditable(collection, obj, cb);
    };
    Operation.prototype.saveNonAuditable = function (collection, obj, cb) {
        var _this = this;
        this.db.collection(collection).save(obj, function (err, res) {
            if (err) {
                _this.logDbError('Error on saving ' + collection + ' entity: ' + err);
                err = _this.defaultErrorMsg();
            }
            cb(err, obj);
        });
    };
    Operation.prototype.delete = function (collection, query, cb) {
        var _this = this;
        this.db.collection(collection).remove(query, function (err, res) {
            if (err) {
                _this.logDbError('Error on removing ' + collection + ' entity: ' + err);
                err = _this.defaultErrorMsg();
            }
            cb(err, res);
        });
    };
    Operation.prototype.update = function (collection, query, update, cb) {
        var _this = this;
        this.db.collection(collection).update(query, update, { multi: true }, function (err, res) {
            if (err) {
                _this.logDbError('Error on updating ' + collection + ' query: ' + JSON.stringify(query)
                    + ', update: ' + JSON.stringify(update) + ' err: ' + err);
                err = _this.defaultErrorMsg();
            }
            cb(err, res);
        });
    };
    Operation.prototype.getNumberFromGetRequest = function (obj) {
        return obj ? parseInt(obj) : 0;
    };
    Operation.prototype.parseSearchRequest = function (req) {
        req.skip = this.getNumberFromGetRequest(req.skip);
        req.take = this.getNumberFromGetRequest(req.take);
    };
    Operation.prototype.isAdmin = function () {
        return this.currentUser && this.currentUser.roles && this.currentUser.roles.indexOf(2) !== -1;
    };
    Operation.prototype.currentUserId = function () {
        return this.currentUser ? this.currentUser.id : null;
    };
    Operation.prototype.currentUserObjectId = function () {
        var id = this.currentUserId();
        return id ? this.getObjectId(id) : null;
    };
    Operation.prototype.currentUserIp = function () {
        return this.expressRequest.ip;
    };
    Operation.prototype.getRandomBetween = function (min, max) {
        var rand = min + Math.floor(Math.random() * (max - min + 1));
        return rand;
    };
    Operation.objectIdRegex = new RegExp("^[0-9a-fA-F]{24}$");
    return Operation;
})();
exports.Operation = Operation;
//# sourceMappingURL=operation.js.map