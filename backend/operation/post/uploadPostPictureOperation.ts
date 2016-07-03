/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import express = require('express');
import fs = require('fs');
import cons = require('../../core/constants');
import removeFileOp = require('../general/removeFileOperation');

var mkdirp = require('mkdirp');
var multer = require('multer');

export class UploadPostPictureOperation extends operation.Operation {
    private static uploadPathExists = false;
    protected request: IUploadPostPictureRequest;

    public execute(cb: (response: IResponse) => void) {
        this.async.waterfall([
                this.ensureUploadFolderExists,
                this.getFileName,
                this.upload
            ],
            this.respond.bind(this, cb));
    }

    private ensureUploadFolderExists = (next) => {
        if (!UploadPostPictureOperation.uploadPathExists){
            mkdirp(cons.Constants.getPictureUploadFolder(), (err) => {
                if (err){
                    this.logError('Failed to check or create picture upload folder: ' + err);
                    err = this.mlt.error_file_not_uploaded;
                }
                else{
                    UploadPostPictureOperation.uploadPathExists = true;
                }

                next(err);
            });
        }
        else{
            next();
        }
    };

    private getFileName = (next) => {
        var name = this.request.accountId.toString() + this.getId();
        next(null, name);
    };

    private upload = (fileName: string, next) => {
        var storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, cons.Constants.getPictureUploadFolder());
            },
            filename: (req, file, cb) => {
                var extension = file.originalname.split('.').pop();
                fileName += '.' + extension;
                cb(null, fileName);
            }
        });

        var uploader = multer({ storage: storage }).array('file');

        uploader(this.request.expressRequest, this.request.expressResponse, (err) => {
            var url = cons.Constants.pictureUploadFolderUrl + fileName;
            next(err, url);
        });
    };

    private respond(cb: (response: IUploadPostPictureResponse) => void, err, pictureUrl: string) {
        var response: IUploadPostPictureResponse = {error: err, pictureUrl: pictureUrl};
        cb(response);
    }
}