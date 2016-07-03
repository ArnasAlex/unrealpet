var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var fse = require('fs-extra');
var path = require('path');
var gm = require('gm');
var operation = require('../base/operation');
var jobDataEntity = require('../../entities/jobDataEntity');
var postEntity = require('../../entities/postEntity');
var accountEntity = require('../../entities/accountEntity');
var constants = require('../../core/constants');
var mkdirp = require('mkdirp');
var OptimizePictureOperation = (function (_super) {
    __extends(OptimizePictureOperation, _super);
    function OptimizePictureOperation() {
        _super.apply(this, arguments);
    }
    OptimizePictureOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.ensureOptimizeFolderExists.bind(this),
            this.optimize.bind(this),
            this.updateUrls.bind(this)
        ], this.respond.bind(this, cb));
    };
    OptimizePictureOperation.prototype.ensureOptimizeFolderExists = function (next) {
        var _this = this;
        if (!OptimizePictureOperation.optimizePathExists) {
            mkdirp(constants.Constants.getOptimizedPictureFolder(), function (err) {
                if (err) {
                    _this.logError('Failed to check or create optimized picture folder: ' + err);
                }
                else {
                    OptimizePictureOperation.optimizePathExists = true;
                }
                next(err);
            });
        }
        else {
            next();
        }
    };
    OptimizePictureOperation.prototype.optimize = function (next) {
        var data = this.request.data;
        this.optimizationTypeValues = this.getOptimizationTypeValues(data.type);
        var notOptimizedFile = this.getNotOptimizedFilePath(data);
        var optimizedFile = this.getOptimizedFilePath(data);
        if (data.type == 3) {
            this.optimizeVideo(notOptimizedFile, optimizedFile, next);
            return;
        }
        this.optimizePicture(notOptimizedFile, optimizedFile, next);
    };
    OptimizePictureOperation.prototype.optimizePicture = function (notOptimizedFile, optimizedFile, next) {
        var options = this.optimizationTypeValues;
        this.executeOptimization(notOptimizedFile, optimizedFile, options.resize, options.addLogo(), next);
    };
    OptimizePictureOperation.prototype.optimizeVideo = function (source, destination, next) {
        var _this = this;
        var coverSource = constants.Constants.changeFileExtension(source, constants.Constants.defaultPictureExtension);
        var coverDestination = constants.Constants.changeFileExtension(destination, constants.Constants.defaultPictureExtension);
        this.copyFile(source, destination, function (err) {
            if (!err) {
                _this.copyFile(coverSource, coverDestination, next);
                return;
            }
            next(err);
        });
    };
    OptimizePictureOperation.prototype.copyFile = function (sourceFile, destinationFile, next) {
        var _this = this;
        fse.copy(sourceFile, destinationFile, function (err) {
            if (err) {
                _this.logError('Failed to copy file source: ' + sourceFile
                    + ' destination: ' + destinationFile
                    + ' err: ' + err);
                next(_this.defaultErrorMsg());
                return;
            }
            next();
        });
    };
    OptimizePictureOperation.prototype.getResizeFunc = function (type) {
        if (type === 1) {
            return function (gmState) { return gmState.resize(640, null, '>'); };
        }
        else if (type === 2) {
            return function (gmState) { return gmState.resize(50, 50, '!'); };
        }
        throw Error('Not recognized job optimization type for resize function: ' + type);
    };
    OptimizePictureOperation.prototype.executeOptimization = function (notOptimizedPath, optimizedPath, resizeFunc, addLogo, next) {
        var gmState = gm(notOptimizedPath);
        gmState = resizeFunc(gmState);
        if (addLogo) {
            gmState = constants.Constants.addLogoToGmState(gmState);
        }
        gmState
            .strip()
            .write(optimizedPath, function (err) {
            next(err);
        });
    };
    OptimizePictureOperation.prototype.getNotOptimizedFilePath = function (fileInfo) {
        var folder = this.optimizationTypeValues.uploadFolder();
        var filePath = path.join(folder, fileInfo.name);
        return filePath;
    };
    OptimizePictureOperation.prototype.getOptimizedFilePath = function (fileInfo) {
        var optimizedFolder = this.optimizationTypeValues.optimizedUploadFolder();
        var fileName = this.optimizationTypeValues.optimizedFileName(fileInfo.name);
        var filePath = path.join(optimizedFolder, fileName);
        return filePath;
    };
    OptimizePictureOperation.prototype.updateUrls = function (next) {
        var urlToReplace = this.getUrlToReplace();
        var newUrl = this.getNewUrl();
        var query = {};
        query[this.optimizationTypeValues.fileFieldName()] = urlToReplace;
        var updateObj = {};
        updateObj[this.optimizationTypeValues.fileFieldName()] = newUrl;
        var update = { $set: updateObj };
        var collectionName = this.optimizationTypeValues.collectionName();
        this.update(collectionName, query, update, next);
    };
    OptimizePictureOperation.prototype.getUrlToReplace = function () {
        var fileData = this.request.data;
        var fileName = fileData.name;
        var folderUrl = this.optimizationTypeValues.uploadFolderUrl();
        var url = folderUrl + fileName;
        return url;
    };
    OptimizePictureOperation.prototype.getNewUrl = function () {
        var fileData = this.request.data;
        var fileName = this.optimizationTypeValues.optimizedFileName(fileData.name);
        var folderUrl = this.optimizationTypeValues.optimizedFolderUrl();
        var url = folderUrl + fileName;
        return url;
    };
    OptimizePictureOperation.prototype.getOptimizationTypeValues = function (type) {
        switch (type) {
            case 2:
                return new AccountLogoTypeValues();
            case 4:
                return new AccountMainPictureTypeValues();
            case 1:
                return new PostPictureTypeValues();
            case 3:
                return new PostVideoTypeValues();
        }
        throw Error('Invalid file optimization type: ' + type);
    };
    OptimizePictureOperation.prototype.respond = function (cb, err) {
        if (err) {
            this.logError('Error on optimizing picture: ' + err);
        }
        var response = { error: err };
        cb(response);
    };
    OptimizePictureOperation.optimizePathExists = false;
    return OptimizePictureOperation;
})(operation.Operation);
exports.OptimizePictureOperation = OptimizePictureOperation;
var PostVideoTypeValues = (function () {
    function PostVideoTypeValues() {
    }
    PostVideoTypeValues.prototype.optimizedFolderUrl = function () {
        return constants.Constants.videoOptimizedFolderUrl;
    };
    PostVideoTypeValues.prototype.uploadFolderUrl = function () {
        return constants.Constants.videoUploadFolderUrl;
    };
    PostVideoTypeValues.prototype.uploadFolder = function () {
        return constants.Constants.getVideoUploadFolder();
    };
    PostVideoTypeValues.prototype.optimizedUploadFolder = function () {
        return constants.Constants.getOptimizedVideoFolder();
    };
    PostVideoTypeValues.prototype.optimizedFileName = function (original) {
        return original;
    };
    PostVideoTypeValues.prototype.collectionName = function () {
        return postEntity.CollectionName;
    };
    PostVideoTypeValues.prototype.fileFieldName = function () {
        return 'pictureUrl';
    };
    return PostVideoTypeValues;
})();
var PictureTypeValues = (function () {
    function PictureTypeValues() {
    }
    PictureTypeValues.prototype.optimizedFolderUrl = function () {
        return constants.Constants.pictureOptimizedFolderUrl;
    };
    PictureTypeValues.prototype.uploadFolderUrl = function () {
        return constants.Constants.pictureUploadFolderUrl;
    };
    PictureTypeValues.prototype.uploadFolder = function () {
        return constants.Constants.getPictureUploadFolder();
    };
    PictureTypeValues.prototype.optimizedUploadFolder = function () {
        return constants.Constants.getOptimizedPictureFolder();
    };
    PictureTypeValues.prototype.optimizedFileName = function (original) {
        var fileName = original;
        if (fileName.indexOf('jpeg') === -1 && fileName.indexOf('jpg') === -1) {
            fileName = constants.Constants.changeFileExtension(fileName, constants.Constants.defaultPictureExtension);
        }
        return fileName;
    };
    PictureTypeValues.prototype.collectionName = function () {
        throw Error('Set collection name');
    };
    PictureTypeValues.prototype.fileFieldName = function () {
        throw Error('Set field name');
    };
    PictureTypeValues.prototype.addLogo = function () {
        throw Error('implement addLogo');
    };
    PictureTypeValues.prototype.resize = function (gmState) {
        throw Error('implement resize');
    };
    return PictureTypeValues;
})();
var PostPictureTypeValues = (function (_super) {
    __extends(PostPictureTypeValues, _super);
    function PostPictureTypeValues() {
        _super.apply(this, arguments);
    }
    PostPictureTypeValues.prototype.resize = function (gmState) {
        return gmState.resize(640, null, '>');
    };
    PostPictureTypeValues.prototype.collectionName = function () {
        return postEntity.CollectionName;
    };
    PostPictureTypeValues.prototype.fileFieldName = function () {
        return 'pictureUrl';
    };
    PostPictureTypeValues.prototype.addLogo = function () {
        return true;
    };
    return PostPictureTypeValues;
})(PictureTypeValues);
var AccountLogoTypeValues = (function (_super) {
    __extends(AccountLogoTypeValues, _super);
    function AccountLogoTypeValues() {
        _super.apply(this, arguments);
    }
    AccountLogoTypeValues.prototype.resize = function (gmState) {
        return gmState.resize(50, 50, '!');
    };
    AccountLogoTypeValues.prototype.collectionName = function () {
        return accountEntity.CollectionName;
    };
    AccountLogoTypeValues.prototype.fileFieldName = function () {
        return 'logo';
    };
    AccountLogoTypeValues.prototype.addLogo = function () {
        return false;
    };
    return AccountLogoTypeValues;
})(PictureTypeValues);
var AccountMainPictureTypeValues = (function (_super) {
    __extends(AccountMainPictureTypeValues, _super);
    function AccountMainPictureTypeValues() {
        _super.apply(this, arguments);
    }
    AccountMainPictureTypeValues.prototype.resize = function (gmState) {
        return gmState.resize(640, null, '>');
    };
    AccountMainPictureTypeValues.prototype.collectionName = function () {
        return accountEntity.CollectionName;
    };
    AccountMainPictureTypeValues.prototype.fileFieldName = function () {
        return 'picture';
    };
    AccountMainPictureTypeValues.prototype.addLogo = function () {
        return true;
    };
    return AccountMainPictureTypeValues;
})(PictureTypeValues);
//# sourceMappingURL=optimizePictureOperation.js.map