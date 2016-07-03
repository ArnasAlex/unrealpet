import mdb = require('mongodb');
import entity = require('./base/entity');

export class FeedbackEntity extends entity.Entity {
    constructor() {
        super();
    }

    public message: string;
    public isHappy: boolean;
    public ip: string;
    public accountId: mdb.ObjectID;

    public createdOn: Date;
}

export var CollectionName = 'feedback';
