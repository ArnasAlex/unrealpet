import mdb = require('mongodb');
import entity = require('./base/entity');

export class ActivityEntity extends entity.Entity {
    constructor() {
        super();
    }

    title: string;
    message: string;
    accountId: mdb.ObjectID;
    type: ActivityType;
    relatedId: mdb.ObjectID;
    data: any;

    createdOn: Date;
}

export var CollectionName = 'activity';
