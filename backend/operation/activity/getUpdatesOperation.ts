/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import accountEntity = require('../../entities/accountEntity');
import activityEntity = require('../../entities/activityEntity');
import envCfg = require('../../config/environmentConfig');

var packageJson = require('../../../package.json');

export class GetUpdatesOperation extends operation.Operation {
    protected request: IGetUpdatesRequest;
    private cb: (response: IGetUpdatesResponse) => void;
    private response: IGetUpdatesResponse;
    private static version: string;
    private versionForDevelop = 'develop';

    public execute(cb: (response: IGetUpdatesResponse) => void) {
        this.cb = cb;
        this.response = <any>{};
        this.async.waterfall([
                this.getActivities,
                this.getVersion
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

        this.db.collection(activityEntity.CollectionName).count(query, (err, count) => {
            this.response.hasActivities = count > 0;
            next(err);
        });
    };

    private getVersion = (next) => {
        if (!GetUpdatesOperation.version){
            var env = this.getEnvironment();
            GetUpdatesOperation.version = env != envCfg.Environment.Local
                ? packageJson.version
                : this.versionForDevelop;
        }

        this.response.version = GetUpdatesOperation.version;
        next(null);
    };

    private getEnvironment = (): envCfg.Environment => {
        return envCfg.EnvironmentConfig.getEnvironment();
    };

    private respond: any = (err) => {
        if (err) this.response.error = err;
        this.cb(this.response);
    }
}