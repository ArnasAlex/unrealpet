/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import accountEntity = require('../../entities/accountEntity');
import accountHelper = require('./accountHelper');
import hash = require('node_hash');

export class LoginOperation extends operation.Operation {
    protected request: ILoginRequest;

    public execute(cb: (response: ILoginAccountResponse) => void) {
        this.async.waterfall([
                this.getUser.bind(this)
            ],
            this.respond.bind(this, cb));
    }

    private getUser(next) {
        var email = this.request.email.toLowerCase();
        var hashedPassword = this.hash(this.request.password, email);
        var doc = {
            email: email,
            password: hashedPassword
        };

        this.db.collection(accountEntity.CollectionName).findOne(doc, (err: string, res: accountEntity.AccountEntity) => {
            if (!err) {
                if (!res){
                    err = this.mlt.login_wrong_email_or_password;
                }
            }
            else{
                this.logDbError(err);
                err = this.defaultErrorMsg();
            }

            var account = res
                ? accountHelper.Helper.map(res)
                : null;

            next(err, account);
        });
    }

    private hash(email: string, password: string) {
        return hash.sha256(email, password);
    }

    private respond(cb: (response: ILoginAccountResponse) => void, err: string, account: accountHelper.Account) {
        var response: ILoginAccountResponse = {
            error: err,
            account: account
        };

        cb(response);
    }
}

export interface ILoginAccountResponse extends IResponse {
    account: accountHelper.Account;
}