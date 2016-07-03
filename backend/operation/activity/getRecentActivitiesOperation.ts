/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import accountEntity = require('../../entities/accountEntity');
import activityEntity = require('../../entities/activityEntity');
import mongodb = require('mongodb');

export class GetRecentActivitiesOperation extends operation.Operation {
    protected request: IGetRecentPostActivitiesRequest;
    private cb: (response: IGetRecentPostActivitiesResponse) => void;
    private accountId: mongodb.ObjectID;

    public execute(cb: (response: IGetRecentPostActivitiesResponse) => void) {
        this.cb = cb;
        this.async.waterfall([
                this.getActivities,
                this.map
            ],
            this.respond
        );
    }

    private getActivities = (next) => {
        var todayMinusMonth = new Date();
        todayMinusMonth.setMonth(-1);

        var query = {
            accountId: this.currentUserObjectId(),
            createdOn: {$gt: todayMinusMonth}
        };

        var sort = { createdOn: -1 };
        this.db.collection(activityEntity.CollectionName).find(query).sort(sort).toArray(next);
    };

    private map = (activities: activityEntity.ActivityEntity[], next) => {
        var list: IRecentActivity[] = this._.map(activities, (activity: activityEntity.ActivityEntity) => {
            var recentActivity: IRecentActivity = {
                relatedId: activity.relatedId.toString(),
                title: activity.title,
                message: activity.message,
                type: activity.type
            };

            return recentActivity;
        });

        next(null, list);
    };

    private respond: any = (err, activities: IRecentActivity[]) => {
        var response: IGetRecentPostActivitiesResponse = {
            error: err,
            list: activities
        };

        this.cb(response);
    }
}