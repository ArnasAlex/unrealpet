/// <reference path="../typings/refs.d.ts" />
import errorEntity = require('../entities/errorLogEntity');
import database = require('./database');

export class Logger {
    public static logError(message: string, type?: ErrorType) {
        var db = database.Database.getInstance().db;

        if (db){
            var doc = new errorEntity.ErrorLogEntity();
            doc.createdOn = new Date();
            doc.message = message;
            doc.type = type ? type : ErrorType.Normal;
            doc.stack = (<any>new Error()).stack.toString();

            db.collection(errorEntity.CollectionName).save(doc, (error, result) => { });
        }
        else{
            console.log('Database is unavailable. Logging Error to console: ' + message);
        }
    }
}