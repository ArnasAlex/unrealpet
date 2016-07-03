/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import accountEntity = require('../../entities/accountEntity');
import accountHelper = require('./accountHelper');
import iexpress = require('express');

export class SignUpByProviderOperation extends operation.Operation {
    protected request: ISignUpByProviderRequest;

    public execute(cb: (response: ISignUpByProviderResponse) => void) {
        this.async.waterfall([
            this.checkEmail.bind(this),
            this.saveAccount.bind(this),
            this.map.bind(this)
        ],
        this.respond.bind(this, cb));
    }

    private checkEmail(next) {
        var emails = this.request.profile.emails;
        if (!emails || emails.length === 0){
            next(null);
            return;
        }

        var email = this.request.profile.emails[0].value.toLowerCase();
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

    private mapRequestToEntity(){
        var acc = new accountEntity.AccountEntity();
        var emails = this.request.profile.emails;
        acc.email = emails && emails.length > 0 ? emails[0].value: null;
        acc.master = {
            name: this.request.profile.displayName
        };

        var providerName = accountHelper.Helper.getProviderName(this.request.provider);
        acc[providerName] = {};
        var providerInfo: accountEntity.IProvider = acc[providerName];
        providerInfo.id = this.request.profile.id;

        return acc;
    }

    private logIncorrectProfileError(){
        var msg = 'Signing up with provider but email is not provided. Provider: '
            + this.request.provider
            + ', Profile: '
            + JSON.stringify(this.request.profile);
        this.logError(msg);
    }

    private map(entity: accountEntity.AccountEntity, next){
        var acc = accountHelper.Helper.map(entity);
        next(null, acc);
    }

    private respond(cb: (response: ISignUpResponse) => void, err, acc: accountHelper.Account) {
        var response: ISignUpByProviderResponse = {
            error: err,
            account: acc
        };
        cb(response);
    }
}

export interface ISignUpByProviderRequest {
    provider: LoginProvider;
    profile: accountHelper.ISignUpProviderProfile;
    req: iexpress.Request;
}

export interface ISignUpByProviderResponse extends IResponse {
    account: accountHelper.Account;
}