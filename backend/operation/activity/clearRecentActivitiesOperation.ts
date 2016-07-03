/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import accountEntity = require('../../entities/accountEntity');
import activityEntity = require('../../entities/activityEntity');
import mongodb = require('mongodb');

export class ClearRecentActivitiesOperation extends operation.Operation {
    protected request: IClearRecentPostActivitiesRequest;
    private cb: (response: IClearRecentPostActivitiesResponse) => void;

    public execute(cb: (response: IClearRecentPostActivitiesResponse) => void) {
        this.cb = cb;
        this.async.waterfall([
                this.updateActivities
            ],
            this.respond
        );
    }

    private updateActivities = (next) => {
        var query = {
            accountId: this.currentUserObjectId()
        };

        this.remove(activityEntity.CollectionName, query, next);
    };

    private respond: any = (err) => {
        var response: IClearRecentPostActivitiesResponse = {
            error: err
        };

        this.cb(response);
    }
}