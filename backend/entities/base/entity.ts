/// <reference path="../../typings/refs.d.ts" />
import mdb = require('mongodb');

export class Entity implements IEntity {
    _id: mdb.ObjectID;
}

export interface IAuditable extends IEntity {
    createdOn: Date;
    updatedOn: Date;
}

export interface IEntity {
    _id: mdb.ObjectID;
}