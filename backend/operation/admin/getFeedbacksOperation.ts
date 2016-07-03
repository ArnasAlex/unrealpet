/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import accountEntity = require('../../entities/accountEntity');
import feedbackEntity = require('../../entities/feedbackEntity');

export class GetFeedbacksOperation extends operation.Operation {
    protected request: IGetFeedbacksRequest;
    private cb: (response: IGetFeedbacksResponse) => void;
    private response: IGetFeedbacksResponse = <any>{};

    public execute(cb: (response: IGetFeedbacksResponse) => void) {
        this.cb = cb;
        this.async.waterfall([
                this.getFeedbacks,
                this.map,
                this.fillAccounts
            ],
            this.respond);
    }

    private getFeedbacks = (next) => {
        var filter = this.getFilter();
        var skip = this.getNumberFromGetRequest(this.request.skip);
        this.db.collection(feedbackEntity.CollectionName)
            .find(filter)
            .sort({createdOn: -1})
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
                        next(err, res);
                    }
                }
        });
    };

    private getTotalCount(filter, feedbacks, next){
        this.db.collection(feedbackEntity.CollectionName).find(filter).count(false, (err, count) => {
            this.response.totalCount = count;
            next(err, feedbacks);
        });
    }

    private getFilter(){
        var result = {};
        var filter = this.request.filter;
        if (filter && filter.length > 0){
            result = {
                $or: [
                    {ip: new RegExp(filter, 'i')},
                    {message: new RegExp(filter, 'i')}
                ]
            }
        }

        return result;
    }

    private map = (feedbacks: feedbackEntity.FeedbackEntity[], next) => {
        var result: Array<IFeedback> = [];
        for (var i = 0; i < feedbacks.length; i++){
            var feed = feedbacks[i];
            var feedback: IFeedback = {
                id: feed._id.toString(),
                accountId: feed.accountId ? feed.accountId.toString() : null,
                name: '',
                ip: feed.ip,
                createdOn: <any>feed.createdOn,
                isHappy: feed.isHappy,
                message: feed.message
            };

            result.push(feedback);
        }

        this.response.list = result;

        next(null);
    };

    private fillAccounts = (next) => {
        var ids = this._.map(this.response.list, x => this.getObjectId(x.accountId));
        ids = this._.uniq(ids);

        var query = {
            _id: {$in : ids}
        };

        var cb = (err, res: accountEntity.AccountEntity[]) => {
            if (!err){
                this._.forEach(this.response.list, (feedback: IFeedback) => {
                    if (feedback.accountId){
                        var account = this._.find(res, x => x._id.toString() === feedback.accountId);
                        if (account){
                            feedback.name = account.name;
                        }
                    }
                });
            }

            next(err);
        };

        this.db.collection(accountEntity.CollectionName).find(query).toArray(cb);
    };

    private respond = (err) => {
        if (err) this.response.error = err;
        this.cb(this.response);
    }
}