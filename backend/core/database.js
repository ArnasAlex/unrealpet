var cfg = require('../config/environmentConfig');
var mongodb = require('mongodb').MongoClient;
var Database = (function () {
    function Database(done) {
        if (Database.instance) {
            throw Error('Use Database.getInstance() instead of instantation.');
        }
        Database.instance = this;
        this.init(done);
    }
    Database.getInstance = function () {
        if (Database.instance) {
            return Database.instance;
        }
        Database.instance = new Database();
        return Database.instance;
    };
    Database.prototype.init = function (done) {
        var _this = this;
        var url = this.getUrl();
        var start = new Date();
        mongodb.connect(url, function (err, db) {
            _this.db = db;
            var end = new Date();
            console.log("Db initialized in: " + (end.getTime() - start.getTime()) + 'ms');
            if (done)
                done();
        });
    };
    Database.prototype.getUrl = function () {
        return cfg.EnvironmentConfig.getConnectionString();
    };
    return Database;
})();
exports.Database = Database;
//# sourceMappingURL=database.js.map