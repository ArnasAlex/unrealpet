/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import express = require('express');
import fs = require('fs');
import cons = require('../../core/constants');
import removeFileOp = require('../general/removeFileOperation');
import optimizePicOp = require('../job/optimizePictureOperation');
import playerEntity = require('../../entities/playerEntity');
import gm = require('gm');

var mkdirp = require('mkdirp');
var multer = require('multer');

export class UploadPlayerPictureOperation extends operation.Operation {
    private static uploadPathExists = false;
    protected request: IUploadPlayerPictureRequest;

    public execute(cb: (response: IResponse) => void) {
        this.async.waterfall([
                this.ensureUploadFolderExists,
                this.upload,
                this.optimize,
                this.cleanup,
                this.updatePlayer,
                this.removePlayerOldPicture
            ],
            this.respond.bind(this, cb));
    }

    private ensureUploadFolderExists = (next) => {
        if (!UploadPlayerPictureOperation.uploadPathExists){
            mkdirp(cons.Constants.getPlayerPictureUploadFolder(), (err) => {
                if (err){
                    this.logError('Failed to check or create picture upload folder: ' + err);
                    err = this.mlt.error_file_not_uploaded;
                }
                else{
                    UploadPlayerPictureOperation.uploadPathExists = true;
                }

                next(err);
            });
        }
        else{
            next();
        }
    };

    private upload = (next) => {
        var fileName = this.currentUserId() + this.getId();
        var storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, cons.Constants.getPlayerPictureUploadFolder());
            },
            filename: (req, file, cb) => {
                var extension = file.originalname.split('.').pop();
                fileName = fileName + '.' + extension;
                cb(null, fileName);
            }
        });

        var uploader = multer({ storage: storage }).array('file');

        uploader(this.expressRequest, this.expressResponse, (err) => {
            next(err, fileName);
        });
    };

    private optimize = (fileName, next) => {
        var folder = cons.Constants.getPlayerPictureUploadFolder();
        var notOptimized = folder + fileName;
        var optimized = cons.Constants.changeFileExtension(notOptimized, cons.Constants.defaultPictureExtension);
        var resize = (gmState: gm.State) => {
            return gmState.resize(640, null, '>');
        };
        this.executeOptimization(notOptimized, optimized, resize, next);
    };

    private executeOptimization(notOptimizedPath, optimizedPath, resizeFunc: (gmState: gm.State) => gm.State, next){
        var gmState = gm(notOptimizedPath);
        gmState = resizeFunc(gmState);

        cons.Constants.addLogoToGmState(gmState);
        gmState
            .strip()
            .write(optimizedPath, (err) => {
                next(err, notOptimizedPath, optimizedPath);
            });
    }

    private cleanup = (notOptimizedPath, optimizedPath, next) => {
        var pictureUrl = cons.Constants.getUrlFromFilePath(optimizedPath);
        if (notOptimizedPath === optimizedPath){
            next(null, pictureUrl);
            return;
        }

        var req: removeFileOp.IRemoveFileRequest = {
            filePath: notOptimizedPath
        };

        this.executeRemoveFileOperation(req, (res: removeFileOp.IRemoveFileResponse) => {
           next(null, pictureUrl);
        });
    };

    private executeRemoveFileOperation(req: removeFileOp.IRemoveFileRequest, cb){
        new removeFileOp.RemoveFileOperation(req).execute(cb);
    }

    private updatePlayer = (pictureUrl: string, next) => {
        var query = new playerEntity.PlayerEntity();
        query.accountId = this.getObjectId(this.currentUserId());
        this.findOne(playerEntity.CollectionName, query, (err, player: playerEntity.PlayerEntity) => {
            if (err){
                next(err);
                return;
            }

            var oldPictureUrl = player ? player.pictureUrl : null;
            if (!player){
                player = this.getNewPlayerEntity();
            }

            player.pictureUrl = pictureUrl;
            this.save(playerEntity.CollectionName, player, (saveErr, res) => {
                next(saveErr, oldPictureUrl, pictureUrl);
            });
        });
    };

    private getNewPlayerEntity(){
        var player = new playerEntity.PlayerEntity();
        player.accountId = this.getObjectId(this.currentUserId());
        player.fights = 0;
        player.defeat = 0;
        player.win = 0;
        player.points = 0;
        player.status = PlayerStatus.NotPlaying;
        player.lastFightOn = new Date();

        return player;
    }

    private removePlayerOldPicture = (oldPictureUrl: string, newPictureUrl: string, next) => {
        if (!oldPictureUrl){
            next(null, newPictureUrl);
            return;
        }

        var oldPicFilePath = cons.Constants.getFilePathFromUrl(oldPictureUrl);
        var req: removeFileOp.IRemoveFileRequest = {
            filePath: oldPicFilePath
        };

        this.executeRemoveFileOperation(req, (res: removeFileOp.IRemoveFileResponse) => {
            next(null, newPictureUrl);
        });
    };

    private respond(cb: (response: IUploadPostPictureResponse) => void, err, pictureUrl: string) {
        var response: IUploadPlayerPictureResponse = {pictureUrl: pictureUrl};
        if (err) response.error = err;
        cb(response);
    }
}