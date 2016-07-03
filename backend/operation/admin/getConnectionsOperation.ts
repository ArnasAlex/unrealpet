/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import accountEntity = require('../../entities/accountEntity');
import connectionEntity = require('../../entities/connectionEntity');

export class GetConnectionsOperation extends operation.Operation {
    protected request: IGetConnectionsRequest;

    public execute(cb: (response: IGetConnectionsResponse) => void) {
        this.async.waterfall([
                this.getConnections.bind(this),
                this.map.bind(this)
            ],
            this.respond.bind(this, cb));
    }

    private getConnections(next) {
        var filter = this.getFilter();
        var skip = this.getNumberFromGetRequest(this.request.skip);
        this.db.collection(connectionEntity.CollectionName)
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
                        next(err, res, null);
                    }
                }
        });
    }

    private getTotalCount(filter, res, next){
        this.db.collection(connectionEntity.CollectionName).find(filter).count(false, (err, count) => {
            next(err, res, count);
        });
    }

    private getFilter(){
        var result = {};
        var filter = this.request.filter;
        if (filter && filter.length > 0){
            result = {
                $or: [
                    {ip: new RegExp(filter, 'i')},
                    {action: new RegExp(filter, 'i')},
                    {accountName: new RegExp(filter, 'i')}
                ]
            }
        }

        return result;
    }

    private map(connections: connectionEntity.ConnectionEntity[], totalCount: number, next) {
        var result: Array<IConnection> = [];
        for (var i = 0; i < connections.length; i++){
            var con = connections[i];
            var connection: IConnection = {
                id: con._id.toString(),
                accountName: con.accountName,
                ip: con.ip,
                date: con.createdOn,
                action: con.action
            };

            result.push(connection);
        }

        next(null, result, totalCount);
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