/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import accountEntity = require('../../entities/accountEntity');

export class SaveAccountOperation extends operation.Operation {
    protected request: ISaveAccountRequest;

    public execute(cb: (response: ISaveAccountResponse) => void) {
        this.async.waterfall([
                this.validate.bind(this),
                this.getAccount.bind(this),
                this.saveAccount.bind(this)
            ],
            this.respond.bind(this, cb));
    }

    private validate(next){
        var error;
        if (!this.request.name){
            error = 'Name is required';
        }

        next(error);
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
        account.name = this.request.name;
        account.type = this.request.type;
        account.breed = this.request.breed;
        account.birthday = this.request.birthday ? new Date(this.request.birthday): null;
        account.about = this.request.about;
    }

    private respond(cb: (response: ISaveAccountResponse) => void, err) {
        var response: ISaveAccountResponse = {error: err};
        cb(response);
    }
}