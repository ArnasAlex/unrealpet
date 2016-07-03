/// <reference path="../typings/refs.d.ts" />
var errorEntity = require('../entities/errorLogEntity');
var database = require('./database');
var Logger = (function () {
    function Logger() {
    }
    Logger.logError = function (message, type) {
        var db = database.Database.getInstance().db;
        if (db) {
            var doc = new errorEntity.ErrorLogEntity();
            doc.createdOn = new Date();
            doc.message = message;
            doc.type = type ? type : 2;
            doc.stack = (new Error()).stack.toString();
            db.collection(errorEntity.CollectionName).save(doc, function (error, result) { });
        }
        else {
            console.log('Database is unavailable. Logging Error to console: ' + message);
        }
    };
    return Logger;
})();
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map