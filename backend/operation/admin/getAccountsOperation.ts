/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import accountEntity = require('../../entities/accountEntity');
import connectionEntity = require('../../entities/connectionEntity');
import accHelper = require('../login/accountHelper');

export class GetAccountsOperation extends operation.Operation {
    protected request: IGetAccountsRequest;

    public execute(cb: (response: IGetAccountsResponse) => void) {
        this.async.waterfall([
                this.getAccounts.bind(this),
                this.getLastActivity.bind(this),
                this.map.bind(this)
            ],
            this.respond.bind(this, cb));
    }

    private getAccounts(next) {
        var filter = this.getFilter();
        var skip = this.getNumberFromGetRequest(this.request.skip);
        var sort = this.getSort();
        this.db.collection(accountEntity.CollectionName)
            .find(filter)
            .sort(sort)
            .skip(skip)
            .limit(this.getNumberFromGetRequest(this.request.take))
            .toArray((err: any, res) => {
                if (err){
                    this.logDbError(err);
                    err = this.defaultErrorMsg();
                    next(err);
                }
                else {
                    if (skip === 0){
                        this.getTotalCount(filter, res, next);
                    } else{
                        next(err, res, null);
                    }
                }
        });
    }

    private getTotalCount(filter, res, next){
        this.db.collection(accountEntity.CollectionName).find(filter).count(false, (err, count) => {
            next(err, res, count);
        });
    }

    private getLastActivity(accounts, count, next) {
        var aggregation = this.getAggregation(accounts);
        this.db.collection(connectionEntity.CollectionName).aggregate(aggregation, (err, res) => {
            next(err, accounts, res, count);
        });
    }

    private getAggregation(accounts: accountEntity.AccountEntity[]){
        var accIds = this._.map(accounts, acc => acc._id);
        var result = [
            {
                $match: {
                    accountId: { $in: accIds }
                }
            },
            {
                $group: {
                    _id: "$accountId",
                    lastActivityOn: { $max: "$createdOn"}
                }
            }
        ];

        return result;
    }

    private getFilter(){
        var result = {};
        var filter = this.request.filter;
        if (filter && filter.length > 0){
            result = {
                $or: [
                    {email: new RegExp(filter, 'i')},
                    {name: new RegExp(filter, 'i')}
                ]
            }
        }

        return result;
    }

    private getSort() {
        var sort = this.request.sort;
        if (sort){
            var property = Object.keys(sort)[0];
            var val = sort[property];
            sort[property] = this.getNumberFromGetRequest(val);
        }
        else{
            sort = {createdOn: -1};
        }

        return sort;
    }

    private map(accounts: accountEntity.AccountEntity[], lastActivities: ILastActivity[], totalCount: number, next) {
        var result: Array<IAccount> = this._.map(accounts, (acc: accountEntity.AccountEntity) => {
            return <IAccount> {
                id: acc._id.toString(),
                name: acc.name,
                email: acc.email,
                createdOn: acc.createdOn,
                lastActivityOn: this.getLastActivityByForAccount(acc._id, lastActivities),
                loginProvider: accHelper.Helper.getLoginProvider(acc),
                master: acc.master ? acc.master.name : null
            };
        });

        next(null, result, totalCount);
    }

    private getLastActivityByForAccount(accId, activities: ILastActivity[]){
        var activity = this._.find(activities, x => x._id.toString() === accId.toString());
        return activity ? activity.lastActivityOn : null;
    }

    private respond(cb: (response: IGetConnectionsResponse) => void, err, connections: IConnection[], totalCount: number) {
        var response: IGetConnectionsResponse = {
            error: err,
            list: connections,
            totalCount: this.getNumberFromGetRequest(this.request.skip) === 0 ? totalCount : undefined
        };
        cb(response);
    }
}

interface ILastActivity {
    _id: string;
    lastActivityOn: Date;
}