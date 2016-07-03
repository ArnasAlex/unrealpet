/// <reference path="../../typings/refs.d.ts" />

import operation = require('../base/operation');
import connectionEntity = require('../../entities/connectionEntity');

export class SaveConnectionOperation extends operation.Operation {
    protected request: ISaveConnectionRequest;

    public execute(cb: (response: ISaveConnectionResponse) => void) {
        this.async.waterfall([
                this.saveConnection.bind(this)
            ],
            this.respond.bind(this, cb));
    }

    private saveConnection(next) {
        var connection = this.mapRequestToEntity(this.request);
        this.saveNonAuditable(connectionEntity.CollectionName, connection, next);
    }

    private mapRequestToEntity(request: ISaveConnectionRequest){
        var connection = new connectionEntity.ConnectionEntity();
        if (request.accountId){
            connection.accountId = this.getObjectId(request.accountId);
        }
        if (request.accountName){
            connection.accountName = request.accountName;
        }
        connection.action = request.action;
        connection.ip = request.ip;
        connection.request = request.request;
        connection.createdOn = new Date();

        return connection;
    }

    private respond(cb: (response: ISavePostResponse) => void, err) {
        var response: ISavePostResponse = {error: err};
        cb(response);
    }
}

export interface ISaveConnectionRequest extends IRequest{
    ip: string;
    action: string;
    accountId: string;
    accountName: string;
    request: string;
}

export interface ISaveConnectionResponse extends IResponse{
}