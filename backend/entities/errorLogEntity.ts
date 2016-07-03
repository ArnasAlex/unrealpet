/// <reference path="../typings/refs.d.ts" />
import entity = require('./base/entity');

export class ErrorLogEntity extends entity.Entity {
    constructor() {
        super();
    }

    public type: ErrorType;
    public message: string;
    public createdOn: Date;
    public stack: string;
}

export var CollectionName = 'errorlog';