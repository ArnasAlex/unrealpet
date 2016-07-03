var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var cons = require('../../core/constants');
var mkdirp = require('mkdirp');
var multer = require('multer');
var ffmpeg = require('fluent-ffmpeg');
var UploadPostVideoOperation = (function (_super) {
    __extends(UploadPostVideoOperation, _super);
    function UploadPostVideoOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.outputExtension = 'mp4';
        this.ensureUploadFolderExists = function (next) {
            if (!UploadPostVideoOperation.uploadPathExists) {
                mkdirp(cons.Constants.getVideoUploadFolder(), function (err) {
                    if (err) {
                        _this.logError('Failed to check or create video upload folder: ' + err);
                        err = _this.mlt.error_file_not_uploaded;
                    }
                    else {
                        UploadPostVideoOperation.uploadPathExists = true;
                    }
                    next(err);
                });
            }
            else {
                next();
            }
        };
        this.getFileName = function (next) {
            var name = _this.getNewFileName();
            next(null, name);
        };
        this.getNewFileName = function () {
            return _this.request.accountId.toString() + _this.getId();
        };
        this.upload = function (fileName, next) {
            var storage = multer.diskStorage({
                destination: function (req, file, cb) {
                    cb(null, cons.Constants.getVideoUploadFolder());
                },
                filename: function (req, file, cb) {
                    var extension = file.originalname.split('.').pop();
                    fileName += '.' + extension;
                    cb(null, fileName);
                }
            });
            var uploader = multer({ storage: storage }).array('file');
            uploader(_this.request.expressRequest, _this.request.expressResponse, function (err) {
                next(err, fileName);
            });
        };
        this.optimize = function (fileName, next) {
            var folder = cons.Constants.getVideoUploadFolder();
            var inputFilePath = folder + fileName;
            var newFileName = _this.getNewFileName();
            var outputVideoFileName = newFileName + '.' + _this.outputExtension;
            var outputVideoPath = folder + outputVideoFileName;
            var outputCoverFileName = newFileName + '.' + cons.Constants.defaultPictureExtension;
            var outputCoverPath = folder + outputCoverFileName;
            var fileUrl = cons.Constants.videoUploadFolderUrl + outputVideoFileName;
            ffmpeg(inputFilePath)
                .output(outputVideoPath)
                .noAudio()
                .size('460x?')
                .duration(10)
                .on('end', function () {
                next(null, outputVideoPath, outputCoverPath);
            })
                .on('error', function (err, stdout, stderr) {
                _this.logError('Error optimizing video input : ' + inputFilePath
                    + ' output: ' + outputVideoPath
                    + ' err: ' + err.toString());
                next(_this.defaultErrorMsg());
            })
                .run();
        };
        this.createCover = function (videoPath, coverPath, next) {
            var fileName = coverPath.split('/').pop();
            var folderName = coverPath.replace(fileName, '');
            ffmpeg(videoPath)
                .on('end', function () {
                var videoUrl = cons.Constants.getUrlFromFilePath(videoPath);
                next(null, videoUrl);
            })
                .on('error', function (err, stdout, stderr) {
                _this.logError('Error creating video cover input : ' + videoPath
                    + ' output: ' + coverPath
                    + ' err: ' + err.toString());
                next(_this.defaultErrorMsg());
            })
                .screenshots({
                timestamps: ['0:00'],
                folder: folderName,
                filename: fileName
            });
        };
    }
    UploadPostVideoOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.ensureUploadFolderExists,
            this.getFileName,
            this.upload,
            this.optimize,
            this.createCover
        ], this.respond.bind(this, cb));
    };
    UploadPostVideoOperation.prototype.respond = function (cb, err, videoUrl) {
        var response = { error: err, videoUrl: videoUrl };
        cb(response);
    };
    UploadPostVideoOperation.uploadPathExists = false;
    return UploadPostVideoOperation;
})(operation.Operation);
exports.UploadPostVideoOperation = UploadPostVideoOperation;
//# sourceMappingURL=uploadPostVideoOperation.js.map