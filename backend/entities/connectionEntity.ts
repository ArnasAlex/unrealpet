import mdb = require('mongodb');
import entity = require('./base/entity');
import commentEntity = require('./commentEntity');

export class ConnectionEntity extends entity.Entity {
    constructor() {
        super();
    }
    public ip: string;
    public accountId: mdb.ObjectID;
    public accountName: string;
    public action: string;
    public request: string;

    public createdOn: Date;
}

export var CollectionName = 'connection';