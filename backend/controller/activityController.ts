/// <reference path="../typings/refs.d.ts" />
import iexpress = require('express');
import controller = require('./base/controller');
import getRecentActivitiesOp = require('../operation/activity/getRecentActivitiesOperation');
import clearRecentActivitiesOp = require('../operation/activity/clearRecentActivitiesOperation');
import getUpdatesOp = require('../operation/activity/getUpdatesOperation');

export class ActivityController extends controller.Controller {
    public getConfig(): IControllerConfig {
        return {
            name: 'activity',
            actions: [
                {
                    name: 'getRecentActivities',
                    func: this.getRecentActivities,
                    method: HttpMethod.get,
                    roles: [Role.Authenticated]
                },
                {
                    name: 'clearRecentActivities',
                    func: this.clearRecentActivities,
                    method: HttpMethod.post,
                    roles: [Role.Authenticated]
                },
                {
                    name: 'getUpdates',
                    func: this.getUpdates,
                    method: HttpMethod.get,
                    roles: [Role.Authenticated]
                }
            ]
        }
    }

    private getRecentActivities = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        new getRecentActivitiesOp.GetRecentActivitiesOperation(null, req).execute((response) => {
            res.send(response);
        });
    };

    private clearRecentActivities = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        new clearRecentActivitiesOp.ClearRecentActivitiesOperation(null, req, res).execute((response) => {
            res.send(response);
        });
    };

    private getUpdates = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        new getUpdatesOp.GetUpdatesOperation(null, req).execute((response) => {
            res.send(response);
        });
    };
}