var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var operation = require('../base/operation');
var jobDataEntity = require('../../entities/jobDataEntity');
var constants = require('../../core/constants');
var postEntity = require('../../entities/postEntity');
var accountEntity = require('../../entities/accountEntity');
var CollectFilesForOptimizationOperation = (function (_super) {
    __extends(CollectFilesForOptimizationOperation, _super);
    function CollectFilesForOptimizationOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.getPostPictures = function (next) {
            var notOptimizedPictureUrl = constants.Constants.pictureUploadFolderUrl;
            var query = { pictureUrl: new RegExp('^' + notOptimizedPictureUrl) };
            _this.db.collection(postEntity.CollectionName).find(query).limit(20).toArray(function (err, posts) {
                var postPictures = _this.getPostPictureNames(posts, 1);
                next(err, postPictures);
            });
        };
        this.getPostVideos = function (postPictures, next) {
            var pics = [];
            if (postPictures) {
                pics = postPictures;
            }
            var notOptimizedVideoUrl = constants.Constants.videoUploadFolderUrl;
            var query = { pictureUrl: new RegExp('^' + notOptimizedVideoUrl) };
            _this.db.collection(postEntity.CollectionName).find(query).limit(20).toArray(function (err, posts) {
                var postPictures = _this.getPostPictureNames(posts, 3);
                if (postPictures) {
                    pics = pics.concat(postPictures);
                }
                next(err, pics);
            });
        };
        this.getAccountPictures = function (postPictures, next) {
            var pics = [];
            if (postPictures) {
                pics = postPictures;
            }
            var notOptimizedPictureUrl = constants.Constants.pictureUploadFolderUrl;
            var query = { $or: [{ logo: new RegExp('^' + notOptimizedPictureUrl) }, { picture: new RegExp('^' + notOptimizedPictureUrl) }] };
            _this.db.collection(accountEntity.CollectionName).find(query).limit(20).toArray(function (err, posts) {
                var accountPictures = _this.getAccountPictureNames(posts);
                if (accountPictures) {
                    pics = pics.concat(accountPictures);
                }
                next(err, pics);
            });
        };
        this.createJobData = function (pics, next) {
            _this.async.each(pics, function (pic, cb) {
                _this.async.waterfall([
                    _this.getExistingJobData.bind(_this, pic),
                    _this.insertJobData.bind(_this)
                ], cb);
            }, next);
        };
    }
    CollectFilesForOptimizationOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.getPostPictures,
            this.getPostVideos,
            this.getAccountPictures,
            this.createJobData
        ], this.respond.bind(this, cb));
    };
    CollectFilesForOptimizationOperation.prototype.getExistingJobData = function (pic, next) {
        var jobData = this.createJobDataEntity(pic);
        var query = {
            type: jobData.type,
            'data.name': jobData.data.name,
            'data.type': jobData.data.type
        };
        this.findOne(jobDataEntity.CollectionName, query, function (err, res) {
            next(err, jobData, res);
        });
    };
    CollectFilesForOptimizationOperation.prototype.insertJobData = function (jobData, existingJobData, next) {
        if (existingJobData) {
            next();
        }
        else {
            this.save(jobDataEntity.CollectionName, jobData, next);
        }
    };
    CollectFilesForOptimizationOperation.prototype.getPostPictureNames = function (posts, type) {
        if (!posts || posts.length === 0) {
            return null;
        }
        var pics = this._.map(posts, function (post) {
            return {
                name: post.pictureUrl,
                type: type
            };
        });
        return pics;
    };
    CollectFilesForOptimizationOperation.prototype.getAccountPictureNames = function (accounts) {
        if (!accounts || accounts.length === 0) {
            return null;
        }
        var notOptimizedPictureUrl = constants.Constants.pictureUploadFolderUrl;
        var pics = this._.map(accounts, function (acc) {
            if (new RegExp('^' + notOptimizedPictureUrl).test(acc.logo)) {
                return {
                    name: acc.logo,
                    type: 2
                };
            }
            else if (new RegExp('^' + notOptimizedPictureUrl).test(acc.picture)) {
                return {
                    name: acc.picture,
                    type: 4
                };
            }
            throw Error('Found not optimized account picture in database but can\'t find in the code: ' + JSON.stringify(acc));
        });
        return pics;
    };
    CollectFilesForOptimizationOperation.prototype.createJobDataEntity = function (pic) {
        var jobData = new jobDataEntity.JobDataEntity();
        jobData.updatedOn = new Date();
        jobData.createdOn = new Date();
        jobData.type = 1;
        jobData.status = 1;
        var fileName = this.getFileNameFromUrl(pic.name, pic.type);
        var data = {
            name: fileName,
            type: pic.type
        };
        jobData.data = data;
        return jobData;
    };
    CollectFilesForOptimizationOperation.prototype.getFileNameFromUrl = function (url, type) {
        var fileName = url.split('/').pop();
        return fileName;
    };
    CollectFilesForOptimizationOperation.prototype.respond = function (cb, err) {
        var response = { error: err };
        cb(response);
    };
    return CollectFilesForOptimizationOperation;
})(operation.Operation);
exports.CollectFilesForOptimizationOperation = CollectFilesForOptimizationOperation;
//# sourceMappingURL=collectFilesForOptimizationOperation.js.map