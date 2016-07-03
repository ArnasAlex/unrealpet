/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import accountEntity = require('../../entities/accountEntity');
import express = require('express');
import fs = require('fs');
import cons = require('../../core/constants');
import removeFileOp = require('../general/removeFileOperation');

var mkdirp = require('mkdirp');
var multer = require('multer');

export class UploadAccountPictureOperation extends operation.Operation {
    private static uploadPathExists = false;
    protected request: IUploadAccountPictureRequest;
    private accountPictureType: AccountPictures;

    public execute(cb: (response: IResponse) => void) {
        this.async.waterfall([
                this.ensureUploadFolderExists.bind(this),
                this.getAccount.bind(this),
                this.getFileName.bind(this),
                this.upload.bind(this),
                this.updateAccountPicture.bind(this),
                this.removeOldFile.bind(this),
            ],
            this.respond.bind(this, cb));
    }

    private ensureUploadFolderExists(next) {
        if (!UploadAccountPictureOperation.uploadPathExists){
            mkdirp(cons.Constants.getPictureUploadFolder(), (err) => {
                if (err){
                    this.logError('Failed to check or create picture upload folder: ' + err);
                    err = this.mlt.error_file_not_uploaded;
                }
                else{
                    UploadAccountPictureOperation.uploadPathExists = true;
                }

                next(err);
            });
        }
        else{
            next();
        }
    }

    private getAccount(next) {
        var id = this.getObjectId(this.request.accountId);
        this.mustFindOne(accountEntity.CollectionName, {_id: id}, (err, res) => {
            next(err, res);
        });
    }

    private getFileName(account: accountEntity.AccountEntity, next) {
        var name = account._id.toString() + this.getId();
        next(null, name, account);
    }

    private upload(fileName: string, account: accountEntity.AccountEntity, next) {
        var storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, cons.Constants.getPictureUploadFolder());
            },
            filename: (req, file, cb) => {
                var extension = file.originalname.split('.').pop();
                fileName += '.' + extension;
                this.accountPictureType = parseInt(req.body.type);
                cb(null, fileName);
            }
        });

        var uploader = multer({ storage: storage }).array('file');

        uploader(this.request.expressRequest, this.request.expressResponse, (err) => {
            var filePath = cons.Constants.pictureUploadFolderUrl + fileName;
            next(err, account, filePath);
        });
    }

    private updateAccountPicture(account: accountEntity.AccountEntity, picturePath: string, next) {
        var pictureToRemove;
        if (this.accountPictureType == AccountPictures.Main){
            pictureToRemove = account.picture;
            account.picture = picturePath;
        }
        else{
            pictureToRemove = account.logo;
            account.logo = picturePath;
        }

        account.updatedOn = new Date();

        this.save(accountEntity.CollectionName, account, (err, res) => {
            if (err){
                err = this.mlt.error_file_not_uploaded;
            }

            next(err, picturePath, pictureToRemove);
        });
    }

    private removeOldFile(uploadedPicture: string, pictureToRemove: string, next) {
        if (pictureToRemove){
            var cb = (err) => {
                next(err, uploadedPicture);
            };

            this.executeRemoveFileOperation(pictureToRemove, cb);
        }
        else {
            next(null, uploadedPicture);
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

    private respond(cb: (response: IUploadAccountPictureResponse) => void, err, pictureUrl: string) {
        var response: IUploadAccountPictureResponse = {error: err, pictureUrl: pictureUrl};
        cb(response);
    }
}