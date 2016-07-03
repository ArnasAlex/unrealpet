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
var UploadPostPictureOperation = (function (_super) {
    __extends(UploadPostPictureOperation, _super);
    function UploadPostPictureOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.ensureUploadFolderExists = function (next) {
            if (!UploadPostPictureOperation.uploadPathExists) {
                mkdirp(cons.Constants.getPictureUploadFolder(), function (err) {
                    if (err) {
                        _this.logError('Failed to check or create picture upload folder: ' + err);
                        err = _this.mlt.error_file_not_uploaded;
                    }
                    else {
                        UploadPostPictureOperation.uploadPathExists = true;
                    }
                    next(err);
                });
            }
            else {
                next();
            }
        };
        this.getFileName = function (next) {
            var name = _this.request.accountId.toString() + _this.getId();
            next(null, name);
        };
        this.upload = function (fileName, next) {
            var storage = multer.diskStorage({
                destination: function (req, file, cb) {
                    cb(null, cons.Constants.getPictureUploadFolder());
                },
                filename: function (req, file, cb) {
                    var extension = file.originalname.split('.').pop();
                    fileName += '.' + extension;
                    cb(null, fileName);
                }
            });
            var uploader = multer({ storage: storage }).array('file');
            uploader(_this.request.expressRequest, _this.request.expressResponse, function (err) {
                var url = cons.Constants.pictureUploadFolderUrl + fileName;
                next(err, url);
            });
        };
    }
    UploadPostPictureOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.ensureUploadFolderExists,
            this.getFileName,
            this.upload
        ], this.respond.bind(this, cb));
    };
    UploadPostPictureOperation.prototype.respond = function (cb, err, pictureUrl) {
        var response = { error: err, pictureUrl: pictureUrl };
        cb(response);
    };
    UploadPostPictureOperation.uploadPathExists = false;
    return UploadPostPictureOperation;
})(operation.Operation);
exports.UploadPostPictureOperation = UploadPostPictureOperation;
//# sourceMappingURL=uploadPostPictureOperation.js.map