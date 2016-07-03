var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var cons = require('../../core/constants');
var gm = require('gm');
var mkdirp = require('mkdirp');
var multer = require('multer');
var UploadCoverPictureOperation = (function (_super) {
    __extends(UploadCoverPictureOperation, _super);
    function UploadCoverPictureOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.coverFileName = 'cover';
        this.uploadedCoverFileName = 'coverUploaded';
        this.ensureUploadFolderExists = function (next) {
            if (!UploadCoverPictureOperation.uploadPathExists) {
                mkdirp(cons.Constants.getCoverUploadFolder(), function (err) {
                    if (err) {
                        _this.logError('Failed to check or create picture upload folder: ' + err);
                        err = _this.mlt.error_file_not_uploaded;
                    }
                    else {
                        UploadCoverPictureOperation.uploadPathExists = true;
                    }
                    next(err);
                });
            }
            else {
                next();
            }
        };
        this.upload = function (next) {
            var fileName;
            var storage = multer.diskStorage({
                destination: function (req, file, cb) {
                    cb(null, cons.Constants.getCoverUploadFolder());
                },
                filename: function (req, file, cb) {
                    var extension = file.originalname.split('.').pop();
                    fileName = _this.uploadedCoverFileName + '.' + extension;
                    cb(null, fileName);
                }
            });
            var uploader = multer({ storage: storage }).array('file');
            uploader(_this.expressRequest, _this.expressResponse, function (err) {
                next(err, fileName);
            });
        };
        this.optimize = function (fileName, next) {
            var coverFolder = cons.Constants.getCoverUploadFolder();
            var notOptimized = coverFolder + fileName;
            var optimized = coverFolder + _this.coverFileName + '.' + cons.Constants.defaultPictureExtension;
            var resize = function (gmState) {
                return gmState.resize(1000, null, '>');
            };
            _this.executeOptimization(notOptimized, optimized, resize, next);
        };
    }
    UploadCoverPictureOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.ensureUploadFolderExists,
            this.upload,
            this.optimize
        ], this.respond.bind(this, cb));
    };
    UploadCoverPictureOperation.prototype.executeOptimization = function (notOptimizedPath, optimizedPath, resizeFunc, next) {
        var gmState = gm(notOptimizedPath);
        gmState = resizeFunc(gmState);
        gmState
            .strip()
            .write(optimizedPath, function (err) {
            next(err);
        });
    };
    UploadCoverPictureOperation.prototype.respond = function (cb, err, pictureUrl) {
        var response = { pictureUrl: pictureUrl };
        if (err)
            response.error = err;
        cb(response);
    };
    UploadCoverPictureOperation.uploadPathExists = false;
    return UploadCoverPictureOperation;
})(operation.Operation);
exports.UploadCoverPictureOperation = UploadCoverPictureOperation;
//# sourceMappingURL=uploadCoverPictureOperation.js.map