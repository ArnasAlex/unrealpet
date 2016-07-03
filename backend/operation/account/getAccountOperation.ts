/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import entity = require('../../entities/accountEntity');

export class GetAccountOperation extends operation.Operation {
    protected request: IGetAccountRequest;

    public execute(cb: (response: IGetAccountResponse) => void) {
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

    private mapEntityToResponse(account: entity.AccountEntity): IGetAccountResponse{
        var birthday = account.birthday
            ? account.birthday.toISOString().slice(0,10)
            : null;

        var response: IGetAccountResponse = {
            name: account.name,
            type: account.type,
            breed: account.breed,
            birthday: birthday,
            about: account.about,
            picture: account.picture,
            logo: account.logo
        };

        return response;
    }

    private respond(cb: (response: IGetAccountResponse) => void, err, account: entity.AccountEntity) {
        var response = err ? <any>{error: err} : this.mapEntityToResponse(account);
        cb(response);
    }
}