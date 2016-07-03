/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import accountEntity = require('../../entities/accountEntity');

export class SaveAccountSettingsOperation extends operation.Operation {
    protected request: ISaveAccountSettingsRequest;

    public execute(cb: (response: ISaveAccountSettingsResponse) => void) {
        this.async.waterfall([
                this.getAccount.bind(this),
                this.saveAccount.bind(this)
            ],
            this.respond.bind(this, cb));
    }

    private getAccount(next) {
        var id = this.getObjectId(this.request.accountId);
        this.mustFindOne(accountEntity.CollectionName, {_id: id}, (err, res) => {
            next(err, res);
        });
    }

    private saveAccount(account: accountEntity.AccountEntity, next) {
        this.mapRequestToEntity(account);
        this.save(accountEntity.CollectionName, account, next);
    }

    private mapRequestToEntity(account: accountEntity.AccountEntity){
        if (!account.settings){
            account.settings = {language: Language.NotDefined};
        }
        account.settings.language = this.request.language;
    }

    private respond(cb: (response: ISaveAccountSettingsResponse) => void, err) {
        var response: ISaveAccountResponse = {error: err};
        cb(response);
    }
}