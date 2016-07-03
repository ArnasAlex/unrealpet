/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import entity = require('../../entities/accountEntity');

export class GetAccountSettingsOperation extends operation.Operation {
    protected request: IGetAccountSettingsRequest;

    public execute(cb: (response: IGetAccountSettingsResponse) => void) {
        this.async.waterfall([
                this.getAccount.bind(this)
            ],
            this.respond.bind(this, cb));
    }

    private getAccount(next) {
        var id = this.getObjectId(this.request.accountId);
        this.mustFindOne(entity.CollectionName, {_id: id}, (err: string, res) => {
            next(err, res);
        });
    }

    private mapEntityToResponse(account: entity.AccountEntity): IGetAccountSettingsResponse{
        var settings = account.settings || <any>{};

        var response: IGetAccountSettingsResponse = {
            language: settings.language,
            email: account.email
        };

        return response;
    }

    private respond(cb: (response: IGetAccountSettingsResponse) => void, err, account: entity.AccountEntity) {
        var response = err ? <any>{error: err} : this.mapEntityToResponse(account);
        cb(response);
    }
}