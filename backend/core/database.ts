/// <reference path="../typings/refs.d.ts" />
import mdb = require('mongodb');
import cfg = require('../config/environmentConfig');

var mongodb = require('mongodb').MongoClient;

export class Database {
    public db: mdb.Db;
    private static instance;

    constructor(done?) {
        if (Database.instance) {
            throw Error('Use Database.getInstance() instead of instantation.');
        }
        Database.instance = this;
        this.init(done);
    }

    public static getInstance(): Database {
        if (Database.instance) {
            return Database.instance;
        }

        Database.instance = new Database();
        return Database.instance;
    }

    private init(done) {
        var url = this.getUrl();

        var start = new Date();
        mongodb.connect(url, (err, db) => {
            this.db = db;
            var end = new Date();
            console.log("Db initialized in: " + (end.getTime() - start.getTime()) + 'ms');
            if (done)
                done();
        });
    }

    private getUrl() {
        return cfg.EnvironmentConfig.getConnectionString();
    }
}