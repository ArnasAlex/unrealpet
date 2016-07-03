/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import accountEntity = require('../../entities/accountEntity');
import removeFileOp = require('../general/removeFileOperation');
import fs = require('fs');
import cons = require('../../core/constants');

export class RemoveAccountPictureOperation extends operation.Operation {
    protected request: IRemoveAccountPictureRequest;

    public execute(cb: (response: IRemoveAccountPictureResponse) => void) {
        this.async.waterfall([
                this.getAccount.bind(this),
                this.removeFile.bind(this),
                this.updateAccount.bind(this)
            ],
            this.respond.bind(this, cb));
    }

    private getAccount(next) {
        var id = this.getObjectId(this.request.accountId);
        this.mustFindOne(accountEntity.CollectionName, {_id: id}, (err, res) => {
            next(err, res);
        });
    }

    private removeFile(account: accountEntity.AccountEntity, next) {
        var pic = this.request.type === AccountPictures.Main ? account.picture : account.logo;
        if (pic){
            var cb = (err) => {
                next(err, account);
            };

            this.executeRemoveFileOperation(pic, cb);
        }
        else {
            next(null, account);
        }
    }

    private executeRemoveFileOperation(pictureUrl, cb){
        var req: removeFileOp.IRemoveFileRequest = {
            filePath: cons.Constants.getFilePathFromUrl(pictureUrl)
        };
        new removeFileOp.RemoveFileOperation(req).execute((res) => {
            var err = res.error;
            if (err){
                err = this.defaultErrorMsg();
            }
            cb(err);
        });
    }

    private updateAccount(account: accountEntity.AccountEntity, next){
        if (this.request.type === AccountPictures.Main){
            account.picture = null;
        }
        else{
            account.logo = null;
        }

        this.save(accountEntity.CollectionName, account, (err, res) => {
           next(err);
        });
    }

    private respond(cb: (response: IRemoveAccountPictureResponse) => void, err) {
        var response: IRemoveAccountPictureResponse = {error: err};
        cb(response);
    }
}