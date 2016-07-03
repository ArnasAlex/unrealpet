/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import express = require('express');
import fs = require('fs');
import cons = require('../../core/constants');
import removeFileOp = require('../general/removeFileOperation');
import optimizePicOp = require('../job/optimizePictureOperation');
import gm = require('gm');

var mkdirp = require('mkdirp');
var multer = require('multer');

export class UploadCoverPictureOperation extends operation.Operation {
    private static uploadPathExists = false;
    protected request: IUploadCoverPictureRequest;
    private coverFileName = 'cover';
    private uploadedCoverFileName = 'coverUploaded';

    public execute(cb: (response: IResponse) => void) {
        this.async.waterfall([
                this.ensureUploadFolderExists,
                this.upload,
                this.optimize
            ],
            this.respond.bind(this, cb));
    }

    private ensureUploadFolderExists = (next) => {
        if (!UploadCoverPictureOperation.uploadPathExists){
            mkdirp(cons.Constants.getCoverUploadFolder(), (err) => {
                if (err){
                    this.logError('Failed to check or create picture upload folder: ' + err);
                    err = this.mlt.error_file_not_uploaded;
                }
                else{
                    UploadCoverPictureOperation.uploadPathExists = true;
                }

                next(err);
            });
        }
        else{
            next();
        }
    };

    private upload = (next) => {
        var fileName;
        var storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, cons.Constants.getCoverUploadFolder());
            },
            filename: (req, file, cb) => {
                var extension = file.originalname.split('.').pop();
                fileName = this.uploadedCoverFileName + '.' + extension;
                cb(null, fileName);
            }
        });

        var uploader = multer({ storage: storage }).array('file');

        uploader(this.expressRequest, this.expressResponse, (err) => {
            next(err, fileName);
        });
    };

    private optimize = (fileName, next) => {
        var coverFolder = cons.Constants.getCoverUploadFolder();
        var notOptimized = coverFolder + fileName;
        var optimized = coverFolder + this.coverFileName + '.' + cons.Constants.defaultPictureExtension;
        var resize = (gmState: gm.State) => {
            return gmState.resize(1000, null, '>');
        };
        this.executeOptimization(notOptimized, optimized, resize, next);
    };

    private executeOptimization(notOptimizedPath, optimizedPath, resizeFunc: (gmState: gm.State) => gm.State, next){
        var gmState = gm(notOptimizedPath);
        gmState = resizeFunc(gmState);

        gmState
            .strip()
            .write(optimizedPath, (err) => {
                next(err);
            });
    }

    private respond(cb: (response: IUploadPostPictureResponse) => void, err, pictureUrl: string) {
        var response: IUploadPostPictureResponse = {pictureUrl: pictureUrl};
        if (err) response.error = err;
        cb(response);
    }
}