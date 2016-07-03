var mongodb = require('mongodb');
var db = require('../../../backend/core/database');
var OperationMocker = (function () {
    function OperationMocker() {
    }
    OperationMocker.mock = function (operation) {
        OperationMocker.mockDb(operation);
        var op = operation;
        return op;
    };
    OperationMocker.getId = function () {
        return new mongodb.ObjectID();
    };
    OperationMocker.getObjectId = function (id) {
        return new mongodb.ObjectID(id);
    };
    OperationMocker.mockDb = function (operation) {
        var colMock = new CollectionMock();
        operation.collectionMock = colMock;
        operation.db = {
            collection: function (collectionName) {
                colMock.name = collectionName;
                return colMock;
            }
        };
        operation.logError = function () { };
    };
    return OperationMocker;
})();
exports.OperationMocker = OperationMocker;
var CollectionMock = (function () {
    function CollectionMock() {
    }
    CollectionMock.prototype.find = function (doc, cb) {
        return this;
    };
    CollectionMock.prototype.findOne = function (doc, cb) {
        cb(null, doc);
    };
    CollectionMock.prototype.sort = function (doc) {
        return this;
    };
    CollectionMock.prototype.limit = function (count) {
        return this;
    };
    CollectionMock.prototype.skip = function (count) {
        return this;
    };
    CollectionMock.prototype.toArray = function (cb) {
        cb(null, []);
    };
    CollectionMock.prototype.save = function (doc, cb) {
        cb(null, doc);
    };
    CollectionMock.prototype.update = function (query, update, options, cb) {
        cb(null, 1);
    };
    CollectionMock.prototype.remove = function (doc, cb) {
        cb(null, null);
    };
    CollectionMock.prototype.count = function (query, cb) {
        cb(null, null);
    };
    CollectionMock.prototype.findAndModify = function (query, sort, updateStatement, options, cb) {
        cb(null, null);
    };
    CollectionMock.prototype.aggregate = function (pipeline, cb) {
        cb(null, null);
    };
    CollectionMock.prototype.setFindOneToNotFound = function () {
        this.findOne = function (doc, cb) {
            cb(null, null);
        };
    };
    CollectionMock.prototype.insert = function (docs, cb) {
        cb(null);
    };
    return CollectionMock;
})();
var colMock = new CollectionMock();
db.Database['getInstance'] = function () {
    return {
        db: {
            collection: function () {
                return colMock;
            }
        }
    };
};
//# sourceMappingURL=operationMocker.js.map