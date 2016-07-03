var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var accountEntity = require('../../entities/accountEntity');
var cons = require('../../core/constants');
var removeFileOp = require('../general/removeFileOperation');
var mkdirp = require('mkdirp');
var multer = require('multer');
var UploadAccountPictureOperation = (function (_super) {
    __extends(UploadAccountPictureOperation, _super);
    function UploadAccountPictureOperation() {
        _super.apply(this, arguments);
    }
    UploadAccountPictureOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.ensureUploadFolderExists.bind(this),
            this.getAccount.bind(this),
            this.getFileName.bind(this),
            this.upload.bind(this),
            this.updateAccountPicture.bind(this),
            this.removeOldFile.bind(this),
        ], this.respond.bind(this, cb));
    };
    UploadAccountPictureOperation.prototype.ensureUploadFolderExists = function (next) {
        var _this = this;
        if (!UploadAccountPictureOperation.uploadPathExists) {
            mkdirp(cons.Constants.getPictureUploadFolder(), function (err) {
                if (err) {
                    _this.logError('Failed to check or create picture upload folder: ' + err);
                    err = _this.mlt.error_file_not_uploaded;
                }
                else {
                    UploadAccountPictureOperation.uploadPathExists = true;
                }
                next(err);
            });
        }
        else {
            next();
        }
    };
    UploadAccountPictureOperation.prototype.getAccount = function (next) {
        var id = this.getObjectId(this.request.accountId);
        this.mustFindOne(accountEntity.CollectionName, { _id: id }, function (err, res) {
            next(err, res);
        });
    };
    UploadAccountPictureOperation.prototype.getFileName = function (account, next) {
        var name = account._id.toString() + this.getId();
        next(null, name, account);
    };
    UploadAccountPictureOperation.prototype.upload = function (fileName, account, next) {
        var _this = this;
        var storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, cons.Constants.getPictureUploadFolder());
            },
            filename: function (req, file, cb) {
                var extension = file.originalname.split('.').pop();
                fileName += '.' + extension;
                _this.accountPictureType = parseInt(req.body.type);
                cb(null, fileName);
            }
        });
        var uploader = multer({ storage: storage }).array('file');
        uploader(this.request.expressRequest, this.request.expressResponse, function (err) {
            var filePath = cons.Constants.pictureUploadFolderUrl + fileName;
            next(err, account, filePath);
        });
    };
    UploadAccountPictureOperation.prototype.updateAccountPicture = function (account, picturePath, next) {
        var _this = this;
        var pictureToRemove;
        if (this.accountPictureType == 1) {
            pictureToRemove = account.picture;
            account.picture = picturePath;
        }
        else {
            pictureToRemove = account.logo;
            account.logo = picturePath;
        }
        account.updatedOn = new Date();
        this.save(accountEntity.CollectionName, account, function (err, res) {
            if (err) {
                err = _this.mlt.error_file_not_uploaded;
            }
            next(err, picturePath, pictureToRemove);
        });
    };
    UploadAccountPictureOperation.prototype.removeOldFile = function (uploadedPicture, pictureToRemove, next) {
        if (pictureToRemove) {
            var cb = function (err) {
                next(err, uploadedPicture);
            };
            this.executeRemoveFileOperation(pictureToRemove, cb);
        }
        else {
            next(null, uploadedPicture);
        }
    };
    UploadAccountPictureOperation.prototype.executeRemoveFileOperation = function (pictureUrl, cb) {
        var _this = this;
        var req = {
            filePath: cons.Constants.getFilePathFromUrl(pictureUrl)
        };
        new removeFileOp.RemoveFileOperation(req).execute(function (res) {
            var err = res.error;
            if (err) {
                err = _this.defaultErrorMsg();
            }
            cb(err);
        });
    };
    UploadAccountPictureOperation.prototype.respond = function (cb, err, pictureUrl) {
        var response = { error: err, pictureUrl: pictureUrl };
        cb(response);
    };
    UploadAccountPictureOperation.uploadPathExists = false;
    return UploadAccountPictureOperation;
})(operation.Operation);
exports.UploadAccountPictureOperation = UploadAccountPictureOperation;
//# sourceMappingURL=uploadAccountPictureOperation.js.map