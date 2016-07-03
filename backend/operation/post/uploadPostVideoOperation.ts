/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import express = require('express');
import fs = require('fs');
import cons = require('../../core/constants');
import removeFileOp = require('../general/removeFileOperation');

var mkdirp = require('mkdirp');
var multer = require('multer');
var ffmpeg = require('fluent-ffmpeg');

export class UploadPostVideoOperation extends operation.Operation {
    private static uploadPathExists = false;
    protected request: IUploadPostVideoRequest;
    private outputExtension = 'mp4';

    public execute(cb: (response: IResponse) => void) {
        this.async.waterfall([
                this.ensureUploadFolderExists,
                this.getFileName,
                this.upload,
                this.optimize,
                this.createCover
            ],
            this.respond.bind(this, cb));
    }

    private ensureUploadFolderExists = (next) => {
        if (!UploadPostVideoOperation.uploadPathExists){
            mkdirp(cons.Constants.getVideoUploadFolder(), (err) => {
                if (err){
                    this.logError('Failed to check or create video upload folder: ' + err);
                    err = this.mlt.error_file_not_uploaded;
                }
                else{
                    UploadPostVideoOperation.uploadPathExists = true;
                }

                next(err);
            });
        }
        else{
            next();
        }
    };

    private getFileName = (next) => {
        var name = this.getNewFileName();
        next(null, name);
    };

    private getNewFileName = () => {
        return this.request.accountId.toString() + this.getId();
    };

    private upload = (fileName: string, next) => {
        var storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, cons.Constants.getVideoUploadFolder());
            },
            filename: (req, file, cb) => {
                var extension = file.originalname.split('.').pop();
                fileName += '.' + extension;
                cb(null, fileName);
            }
        });

        var uploader = multer({ storage: storage }).array('file');

        uploader(this.request.expressRequest, this.request.expressResponse, (err) => {
            next(err, fileName);
        });
    };

    private optimize = (fileName: string, next) => {
        var folder = cons.Constants.getVideoUploadFolder();
        var inputFilePath = folder + fileName;
        var newFileName = this.getNewFileName();
        var outputVideoFileName = newFileName + '.' + this.outputExtension;
        var outputVideoPath = folder + outputVideoFileName;
        var outputCoverFileName = newFileName + '.' + cons.Constants.defaultPictureExtension;
        var outputCoverPath = folder + outputCoverFileName;

        var fileUrl = cons.Constants.videoUploadFolderUrl + outputVideoFileName;
        ffmpeg(inputFilePath)
            .output(outputVideoPath)
            .noAudio()
            .size('460x?')
            .duration(10)
            .on('end', () => {
                next(null, outputVideoPath, outputCoverPath);
            })
            .on('error', (err, stdout, stderr) => {
                this.logError('Error optimizing video input : ' + inputFilePath
                    + ' output: ' + outputVideoPath
                    + ' err: ' + err.toString());
                next(this.defaultErrorMsg());
            })
            .run();
    };

    private createCover = (videoPath, coverPath, next) => {
        var fileName = coverPath.split('/').pop();
        var folderName = coverPath.replace(fileName, '');
        ffmpeg(videoPath)
            .on('end', () => {
                var videoUrl = cons.Constants.getUrlFromFilePath(videoPath);
                next(null, videoUrl);
            })
            .on('error', (err, stdout, stderr) => {
                this.logError('Error creating video cover input : ' + videoPath
                    + ' output: ' + coverPath
                    + ' err: ' + err.toString());
                next(this.defaultErrorMsg());
            })
            .screenshots({
                timestamps: ['0:00'],
                folder: folderName,
                filename: fileName
            });
    };

    private respond(cb: (response: IUploadPostVideoResponse) => void, err, videoUrl: string) {
        var response: IUploadPostVideoResponse = {error: err, videoUrl: videoUrl};
        cb(response);
    }
}