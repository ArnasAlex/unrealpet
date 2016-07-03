/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import accountEntity = require('../../entities/accountEntity');
import hash = require('node_hash');
import accountHelper = require('./accountHelper');
import iexpress = require('express');

export class SignUpLocalOperation extends operation.Operation {
    protected request: ISignUpLocalRequest;

    public execute(cb: (response: ISignUpResponse) => void) {
        this.async.waterfall([
            this.checkEmail.bind(this),
            this.saveAccount.bind(this)
        ],
        this.respond.bind(this, cb));
    }

    private checkEmail(next) {
        var email = this.request.email.toLowerCase();
        this.db.collection(accountEntity.CollectionName).findOne({email: email}, (err: string, res) => {
            if (!err) {
                if (res){
                    err = this.mlt.login_email_exists;
                }
            }
            else{
                this.logDbError(err);
                err = this.defaultErrorMsg();
            }

            next(err);
        });
    }

    private saveAccount(next) {
        var acc = this.mapRequestToEntity();
        accountHelper.Helper.setDefaultValuesForNewAccount(acc);
        accountHelper.Helper.setLanguageForNewAccount(acc, this.request.req);
        this.save(accountEntity.CollectionName, acc, next);
    }

    private hash(password: string, email: string) {
        return hash.sha256(password, email);
    }

    private mapRequestToEntity(){
        var account = new accountEntity.AccountEntity();
        account.email = this.request.email.toLowerCase();
        account.password = this.hash(this.request.password, account.email);

        return account;
    }

    private respond(cb: (response: ISignUpResponse) => void, err) {
        var response: ISignUpResponse = {error: err};
        cb(response);
    }
}

export interface ISignUpLocalRequest extends ISignUpRequest {
    req: iexpress.Request;
}