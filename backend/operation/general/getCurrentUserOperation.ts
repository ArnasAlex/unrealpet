/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import accountEntity = require('../../entities/accountEntity');
import postEntity = require('../../entities/postEntity');

export class GetCurrentUserOperation extends operation.Operation {
    protected request: IGetCurrentUserRequest;

    public execute(cb: (response: IGetCurrentUserResponse) => void) {
        this.async.waterfall([
                this.getAccount,
                this.getPostInfo
            ],
            this.respond.bind(this, cb));
    }

    private getAccount = (next) => {
        var accountId = this.request.accountId;
        if (!accountId){
            next(null, this.getUnauthenticatedUser());
            return;
        }

        this.getAuthenticatedUser(next, accountId);
    };

    private getPostInfo = (user: ICurrentUser, next) => {
        var accountId = this.request.accountId;
        if (!accountId) {
            next(null, user);
            return;
        }

        var query = {ownerId: this.getObjectId(accountId) };
        this.db.collection(postEntity.CollectionName).count(query, (err, res) => {
            if (err) {
                this.logDbError(err.toString());
            }
            else {
                user.postCount = res;
            }
            next(err, user);
        });
    };

    private getUnauthenticatedUser(): ICurrentUser {
        return {
            isAuthenticated: false,
            email: null,
            language: Language.NotDefined,
            name: null,
            postCount: 0
        }
    }

    private getAuthenticatedUser(next, accountId: string){
        this.db.collection(accountEntity.CollectionName).findOne({_id: this.getObjectId(accountId)}, (err: string, res) => {
            var account = null;
            if (!err) {
                if (res) {
                    account = this.map(res);
                }
                else{
                    this.logError('Account was not found by id: ' + accountId);
                    account = this.getUnauthenticatedUser();
                }
            }
            else{
                this.logDbError(err);
                err = this.defaultErrorMsg();
            }

            next(err, account);
        });
    }

    private map(account: accountEntity.AccountEntity): ICurrentUser{
        return {
            isAuthenticated: true,
            email: account.email,
            language: account.settings ? account.settings.language : Language.NotDefined,
            name: account.name,
            postCount: 0
        }
    }

    private respond(cb: (response: ISignUpResponse) => void, err, acc: ICurrentUser) {
        var response: IGetCurrentUserResponse = {error: err, user: acc};
        cb(response);
    }
}

export interface IGetCurrentUserRequest {
    accountId: string;
}