/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import errorEntity = require('../../entities/errorLogEntity');

export class GetErrorsOperation extends operation.Operation {
    protected request: IGetErrorsRequest;

    public execute(cb: (response: IGetErrorsResponse) => void) {
        this.async.waterfall([
                this.getErrors.bind(this),
                this.map.bind(this)
            ],
            this.respond.bind(this, cb));
    }

    private getErrors(next) {
        var filter = this.getFilter();
        this.parseSearchRequest(this.request);
        this.db.collection(errorEntity.CollectionName)
            .find(filter)
            .sort({createdOn: -1})
            .skip(this.request.skip)
            .limit(this.request.take)
            .toArray((err: any, res) => {
                if (err){
                    this.logDbError(err);
                    err = this.defaultErrorMsg();
                    next(err);
                }
                else {
                    if (this.request.skip === 0){
                        this.getTotalCount(filter, res, next);
                    } else{
                        next(err, res, null);
                    }
                }
        });
    }

    private getTotalCount(filter, res, next){
        this.db.collection(errorEntity.CollectionName).find(filter).count(false, (err, count) => {
            next(err, res, count);
        });
    }

    private getFilter(){
        var result = {};
        var filter = this.request.filter;
        if (filter && filter.length > 0){
            result = {message: new RegExp(filter, 'i')};
        }

        return result;
    }

    private map(errors: errorEntity.ErrorLogEntity[], totalCount: number, next) {
        var result: Array<IError> = this._.map(errors, (err) => {
            return {
                id: err._id.toString(),
                message: err.message,
                type: err.type,
                date: err.createdOn
            }
        });

        next(null, result, totalCount);
    }

    private respond(cb: (response: IGetErrorsResponse) => void, err, errors: IError[], totalCount: number) {
        var response: IGetErrorsResponse = {
            error: err,
            list: errors,
            totalCount: this.getNumberFromGetRequest(this.request.skip) === 0 ? totalCount : undefined
        };
        cb(response);
    }
}