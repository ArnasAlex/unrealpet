/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import accountEntity = require('../../entities/accountEntity');
import accHelper = require('./accountHelper');
import hash = require('node_hash');

export class GetAccountByProviderOperation extends operation.Operation {
    protected request: IGetAccountByProviderRequest;

    public execute(cb: (response: IGetAccountByProviderResponse) => void) {
        this.async.waterfall([
                this.getUser.bind(this)
            ],
            this.respond.bind(this, cb));
    }

    private getUser(next) {
        var provider = accHelper.Helper.getProviderName(this.request.provider);
        var query = {};
        query[provider] = {id: this.request.id};

        this.findOne(accountEntity.CollectionName, query, (err, res)=>{
            var account = res
                ? accHelper.Helper.map(res)
                : null;

            next(err, account);
        });
    }

    private respond(cb: (response: IGetAccountByProviderResponse) => void, err: string, account: accHelper.Account) {
        var response: IGetAccountByProviderResponse = {
            error: err,
            account: account,
            exists: account !== null
        };

        cb(response);
    }
}

export interface IGetAccountByProviderRequest extends IRequest {
    provider: LoginProvider;
    id: string;
}

export interface IGetAccountByProviderResponse extends IResponse {
    account: accHelper.Account;
    exists: boolean;
}