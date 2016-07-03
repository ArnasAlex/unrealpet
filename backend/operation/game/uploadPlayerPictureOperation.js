var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var cons = require('../../core/constants');
var removeFileOp = require('../general/removeFileOperation');
var playerEntity = require('../../entities/playerEntity');
var gm = require('gm');
var mkdirp = require('mkdirp');
var multer = require('multer');
var UploadPlayerPictureOperation = (function (_super) {
    __extends(UploadPlayerPictureOperation, _super);
    function UploadPlayerPictureOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.ensureUploadFolderExists = function (next) {
            if (!UploadPlayerPictureOperation.uploadPathExists) {
                mkdirp(cons.Constants.getPlayerPictureUploadFolder(), function (err) {
                    if (err) {
                        _this.logError('Failed to check or create picture upload folder: ' + err);
                        err = _this.mlt.error_file_not_uploaded;
                    }
                    else {
                        UploadPlayerPictureOperation.uploadPathExists = true;
                    }
                    next(err);
                });
            }
            else {
                next();
            }
        };
        this.upload = function (next) {
            var fileName = _this.currentUserId() + _this.getId();
            var storage = multer.diskStorage({
                destination: function (req, file, cb) {
                    cb(null, cons.Constants.getPlayerPictureUploadFolder());
                },
                filename: function (req, file, cb) {
                    var extension = file.originalname.split('.').pop();
                    fileName = fileName + '.' + extension;
                    cb(null, fileName);
                }
            });
            var uploader = multer({ storage: storage }).array('file');
            uploader(_this.expressRequest, _this.expressResponse, function (err) {
                next(err, fileName);
            });
        };
        this.optimize = function (fileName, next) {
            var folder = cons.Constants.getPlayerPictureUploadFolder();
            var notOptimized = folder + fileName;
            var optimized = cons.Constants.changeFileExtension(notOptimized, cons.Constants.defaultPictureExtension);
            var resize = function (gmState) {
                return gmState.resize(640, null, '>');
            };
            _this.executeOptimization(notOptimized, optimized, resize, next);
        };
        this.cleanup = function (notOptimizedPath, optimizedPath, next) {
            var pictureUrl = cons.Constants.getUrlFromFilePath(optimizedPath);
            if (notOptimizedPath === optimizedPath) {
                next(null, pictureUrl);
                return;
            }
            var req = {
                filePath: notOptimizedPath
            };
            _this.executeRemoveFileOperation(req, function (res) {
                next(null, pictureUrl);
            });
        };
        this.updatePlayer = function (pictureUrl, next) {
            var query = new playerEntity.PlayerEntity();
            query.accountId = _this.getObjectId(_this.currentUserId());
            _this.findOne(playerEntity.CollectionName, query, function (err, player) {
                if (err) {
                    next(err);
                    return;
                }
                var oldPictureUrl = player ? player.pictureUrl : null;
                if (!player) {
                    player = _this.getNewPlayerEntity();
                }
                player.pictureUrl = pictureUrl;
                _this.save(playerEntity.CollectionName, player, function (saveErr, res) {
                    next(saveErr, oldPictureUrl, pictureUrl);
                });
            });
        };
        this.removePlayerOldPicture = function (oldPictureUrl, newPictureUrl, next) {
            if (!oldPictureUrl) {
                next(null, newPictureUrl);
                return;
            }
            var oldPicFilePath = cons.Constants.getFilePathFromUrl(oldPictureUrl);
            var req = {
                filePath: oldPicFilePath
            };
            _this.executeRemoveFileOperation(req, function (res) {
                next(null, newPictureUrl);
            });
        };
    }
    UploadPlayerPictureOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.ensureUploadFolderExists,
            this.upload,
            this.optimize,
            this.cleanup,
            this.updatePlayer,
            this.removePlayerOldPicture
        ], this.respond.bind(this, cb));
    };
    UploadPlayerPictureOperation.prototype.executeOptimization = function (notOptimizedPath, optimizedPath, resizeFunc, next) {
        var gmState = gm(notOptimizedPath);
        gmState = resizeFunc(gmState);
        cons.Constants.addLogoToGmState(gmState);
        gmState
            .strip()
            .write(optimizedPath, function (err) {
            next(err, notOptimizedPath, optimizedPath);
        });
    };
    UploadPlayerPictureOperation.prototype.executeRemoveFileOperation = function (req, cb) {
        new removeFileOp.RemoveFileOperation(req).execute(cb);
    };
    UploadPlayerPictureOperation.prototype.getNewPlayerEntity = function () {
        var player = new playerEntity.PlayerEntity();
        player.accountId = this.getObjectId(this.currentUserId());
        player.fights = 0;
        player.defeat = 0;
        player.win = 0;
        player.points = 0;
        player.status = 0;
        player.lastFightOn = new Date();
        return player;
    };
    UploadPlayerPictureOperation.prototype.respond = function (cb, err, pictureUrl) {
        var response = { pictureUrl: pictureUrl };
        if (err)
            response.error = err;
        cb(response);
    };
    UploadPlayerPictureOperation.uploadPathExists = false;
    return UploadPlayerPictureOperation;
})(operation.Operation);
exports.UploadPlayerPictureOperation = UploadPlayerPictureOperation;
//# sourceMappingURL=uploadPlayerPictureOperation.js.map