import mongodb = require('mongodb');
import op = require('../../../backend/operation/base/operation');
import db = require('../../../backend/core/database');

export class OperationMocker {
    public static mock(operation: op.Operation): IMockedOperation{
        OperationMocker.mockDb(<any>operation);

        var op: any = operation;
        return <IMockedOperation>op;
    }

    public static getId(): mongodb.ObjectID {
        return new mongodb.ObjectID();
    }

    public static getObjectId(id: string) {
        return new mongodb.ObjectID(id);
    }

    private static mockDb(operation: IMockedOperation){
        var colMock = new CollectionMock();
        operation.collectionMock = colMock;
        operation.db = {
            collection: (collectionName) => {
                colMock.name = collectionName;
                return colMock;
            }
        };

        operation.logError = () => {};
    }
}

export interface IMockedOperation {
    collectionMock: CollectionMock;
    db: any;
    logError: (err: string) => void;
}

class CollectionMock {
    public name: string;

    public find(doc, cb) {
        return this;
    }

    public findOne(doc, cb) {
        cb(null, doc);
    }

    public sort(doc) {
        return this;
    }

    public limit(count: number) {
        return this;
    }

    public skip(count: number){
        return this;
    }

    public toArray(cb) {
        cb(null, []);
    }

    public save(doc, cb) {
        cb(null, doc);
    }

    public update(query, update, options, cb) {
        cb(null, 1);
    }

    public remove(doc, cb) {
        cb(null, null);
    }

    public count(query, cb){
        cb(null, null);
    }

    public findAndModify(query, sort, updateStatement, options, cb) {
        cb(null, null);
    }

    public aggregate(pipeline, cb){
        cb(null, null);
    }

    public setFindOneToNotFound(){
        this.findOne = (doc, cb) => {
            cb(null, null);
        }
    }

    public insert(docs, cb){
        cb(null);
    }
}

// Globally override getInstance so that no operation uses real database on tests
var colMock = new CollectionMock();
db.Database['getInstance'] = (): any => {
    return {
        db: {
            collection: () => {
                return colMock;
            }
        }
    }
};