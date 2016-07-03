var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var fs = require('fs');
var operation = require('../base/operation');
var constants = require('../../core/constants');
var postEntity = require('../../entities/postEntity');
var accountEntity = require('../../entities/accountEntity');
var FileCleanupOpration = (function (_super) {
    __extends(FileCleanupOpration, _super);
    function FileCleanupOpration() {
        var _this = this;
        _super.apply(this, arguments);
        this.expirationTimeMs = 1000 * 60 * 60;
        this.fileBatchCount = 50;
        this.getFiles = function (next) {
            _this.async.map([
                constants.Constants.getPictureUploadFolder(),
                constants.Constants.getVideoUploadFolder()
            ], _this.getFilesWithFullPath, function (err, result) {
                if (err) {
                    throw Error(err.toString());
                }
                var files = _this.matrixToArray(result);
                files = _this._.take(files, _this.fileBatchCount);
                next(err, files);
            });
        };
        this.filterOldFiles = function (files, next) {
            var now = new Date().getTime();
            _this.async.map(files, _this.fsStat, function (err, results) {
                var filteredFileStats = _this._.filter(results, function (fileStat) {
                    var endTime = fileStat.stat.ctime.getTime() + _this.expirationTimeMs;
                    return now > endTime;
                });
                var filteredFiles = _this._.map(filteredFileStats, function (stats) { return stats.file; });
                next(err, filteredFiles);
            });
        };
        this.checkUsagesInDatabase = function (files, next) {
            if (files.length === 0) {
                next(null, files);
                return;
            }
            var databasePicturesSchema = _this.getDatabasePicturesSchema();
            _this.async.map(databasePicturesSchema.collections, function (collection, cb) { _this.findInDatabase(collection, files, cb); }, function (err, results) {
                var filesFound = _this.matrixToArray(results);
                if (filesFound.length > 0) {
                    _this.logError('Found unoptimized files that should be already optimized: '
                        + filesFound.join(', '), 1);
                }
                var notFoundFiles = _this._.difference(files, filesFound);
                next(err, notFoundFiles);
            });
        };
        this.findInDatabase = function (collection, files, cb) {
            var urls = _this._.map(files, function (file) { return constants.Constants.getUrlFromFilePath(file); });
            var query = { $or: [] };
            collection.fields.forEach(function (field) {
                var queryPart = {};
                queryPart[field] = { $in: urls };
                query.$or.push(queryPart);
            });
            _this.db.collection(collection.name).find(query).toArray(function (err, records) {
                var foundUrls = [];
                records.forEach(function (record) {
                    collection.fields.forEach(function (field) {
                        var url = record[field];
                        if (urls.indexOf(url) !== -1) {
                            foundUrls.push(url);
                        }
                    });
                });
                var files = _this._.map(foundUrls, function (url) { return constants.Constants.getFilePathFromUrl(url); });
                cb(err, files);
            });
        };
        this.clean = function (files, next) {
            _this.async.map(files, _this.fsUnlink, function (err, result) {
                next(err, files.length > 0);
            });
        };
        this.fsUnlink = function (filePath, cb) {
            fs.unlink(filePath, cb);
        };
        this.getFilesWithFullPath = function (dir, cb) {
            _this.fsReadDir(dir, function (err, files) {
                var filesWithPath = _this._.map(files, function (file) {
                    return dir + file;
                });
                cb(err, filesWithPath);
            });
        };
        this.fsReadDir = function (dir, cb) {
            fs.readdir(dir, cb);
        };
        this.fsStat = function (file, cb) {
            fs.stat(file, function (err, stat) {
                var result = {
                    file: file,
                    stat: stat
                };
                cb(err, result);
            });
        };
        this.getDatabasePicturesSchema = function () {
            var post = {
                name: postEntity.CollectionName,
                fields: ['pictureUrl']
            };
            var account = {
                name: accountEntity.CollectionName,
                fields: ['logo', 'picture']
            };
            var schema = {
                collections: [post, account]
            };
            return schema;
        };
    }
    FileCleanupOpration.prototype.execute = function (cb) {
        this.async.waterfall([
            this.getFiles,
            this.filterOldFiles,
            this.checkUsagesInDatabase,
            this.clean
        ], this.respond.bind(this, cb));
    };
    FileCleanupOpration.prototype.matrixToArray = function (matrix) {
        var result = [];
        matrix.forEach(function (stringArr) {
            stringArr.forEach(function (str) {
                result.push(str);
            });
        });
        return result;
    };
    FileCleanupOpration.prototype.respond = function (cb, err, haveWorked) {
        var response = {
            error: err,
            haveWorked: haveWorked
        };
        cb(response);
    };
    return FileCleanupOpration;
})(operation.Operation);
exports.FileCleanupOpration = FileCleanupOpration;
//# sourceMappingURL=fileCleanupOperation.js.map