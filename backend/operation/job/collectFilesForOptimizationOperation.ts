/// <reference path="../../typings/refs.d.ts" />
import fs = require('fs');
import operation = require('../base/operation');
import jobDataEntity = require('../../entities/jobDataEntity');
import constants = require('../../core/constants');
import postEntity = require('../../entities/postEntity');
import accountEntity = require('../../entities/accountEntity');

export class CollectFilesForOptimizationOperation extends operation.Operation {
    protected request: ICollectFilesForOptimizationRequest;

    public execute(cb: (response: ICollectFilesForOptimizationResponse) => void) {
        this.async.waterfall([
                this.getPostPictures,
                this.getPostVideos,
                this.getAccountPictures,
                this.createJobData
            ],
            this.respond.bind(this, cb));
    }

    private getPostPictures = (next) => {
        var notOptimizedPictureUrl = constants.Constants.pictureUploadFolderUrl;
        var query = {pictureUrl: new RegExp('^' + notOptimizedPictureUrl)};
        this.db.collection(postEntity.CollectionName).find(query).limit(20).toArray((err, posts) => {
            var postPictures: IPictureToOptimize[] = this.getPostPictureNames(posts, jobDataEntity.FileOptimizationType.PostPicture);
            next(err, postPictures);
        });
    };

    private getPostVideos = (postPictures, next) => {
        var pics = [];
        if (postPictures){
            pics = postPictures;
        }
        var notOptimizedVideoUrl = constants.Constants.videoUploadFolderUrl;
        var query = {pictureUrl: new RegExp('^' + notOptimizedVideoUrl)};
        this.db.collection(postEntity.CollectionName).find(query).limit(20).toArray((err, posts) => {
            var postPictures: IPictureToOptimize[] = this.getPostPictureNames(posts, jobDataEntity.FileOptimizationType.PostVideo);
            if (postPictures){
                pics = pics.concat(postPictures);
            }
            next(err, pics);
        });
    };

    private getAccountPictures = (postPictures: IPictureToOptimize[], next) => {
        var pics = [];
        if (postPictures){
            pics = postPictures;
        }
        var notOptimizedPictureUrl = constants.Constants.pictureUploadFolderUrl;
        var query = {$or: [{logo: new RegExp('^' + notOptimizedPictureUrl)}, {picture: new RegExp('^' + notOptimizedPictureUrl)}]};
        this.db.collection(accountEntity.CollectionName).find(query).limit(20).toArray((err, posts) => {
            var accountPictures: IPictureToOptimize[] = this.getAccountPictureNames(posts);
            if (accountPictures){
                pics = pics.concat(accountPictures);
            }
            next(err, pics);
        });
    };

    private createJobData = (pics: IPictureToOptimize[], next) => {
        this.async.each(pics, (pic: IPictureToOptimize, cb) => {
            this.async.waterfall([
                this.getExistingJobData.bind(this, pic),
                this.insertJobData.bind(this)
            ], cb);
        }, next);
    };

    private getExistingJobData(pic: IPictureToOptimize, next) {
        var jobData = this.createJobDataEntity(pic);
        var query = {
            type: jobData.type,
            'data.name': jobData.data.name,
            'data.type': jobData.data.type
        };

        this.findOne(jobDataEntity.CollectionName, query, (err, res) => {
            next(err, jobData, res);
        });
    }

    private insertJobData(jobData: jobDataEntity.JobDataEntity, existingJobData: jobDataEntity.JobDataEntity, next){
        if (existingJobData){
            next();
        } else{
           this.save(jobDataEntity.CollectionName, jobData, next);
        }
    }

    private getPostPictureNames(posts: postEntity.PostEntity[], type: jobDataEntity.FileOptimizationType): IPictureToOptimize[]{
        if (!posts || posts.length === 0){
            return null;
        }
        var pics: IPictureToOptimize[] = this._.map(posts, (post: postEntity.PostEntity) => {
            return <IPictureToOptimize>{
                name: post.pictureUrl,
                type: type
            };
        });

        return pics;
    }

    private getAccountPictureNames(accounts: accountEntity.AccountEntity[]): IPictureToOptimize[]{
        if (!accounts || accounts.length === 0){
            return null;
        }

        var notOptimizedPictureUrl = constants.Constants.pictureUploadFolderUrl;
        var pics: IPictureToOptimize[] = this._.map(accounts, (acc: accountEntity.AccountEntity) => {
            if (new RegExp('^' + notOptimizedPictureUrl).test(acc.logo)){
                return <IPictureToOptimize>{
                    name: acc.logo,
                    type: jobDataEntity.FileOptimizationType.AccountLogo
                };
            }
            else if (new RegExp('^' + notOptimizedPictureUrl).test(acc.picture)){
                return <IPictureToOptimize>{
                    name: acc.picture,
                    type: jobDataEntity.FileOptimizationType.AccountMainPicture
                };
            }

            throw Error('Found not optimized account picture in database but can\'t find in the code: ' + JSON.stringify(acc));

        });
        return pics;
    }

    private createJobDataEntity(pic: IPictureToOptimize){
        var jobData = new jobDataEntity.JobDataEntity();
        jobData.updatedOn = new Date();
        jobData.createdOn = new Date();
        jobData.type = jobDataEntity.JobType.FileOptimization;
        jobData.status = jobDataEntity.JobDataStatus.Created;

        var fileName = this.getFileNameFromUrl(pic.name, pic.type);
        var data: jobDataEntity.IFileOptimizationJobData = {
            name: fileName,
            type: pic.type
        };

        jobData.data = data;

        return jobData;
    }

    private getFileNameFromUrl(url: string, type: jobDataEntity.FileOptimizationType){
        var fileName = url.split('/').pop();
        return fileName;
    }

    private respond(cb: (response: ICollectFilesForOptimizationResponse) => void, err) {
        var response: ICollectFilesForOptimizationResponse = {error: err};
        cb(response);
    }
}

interface IPictureToOptimize {
    type: jobDataEntity.FileOptimizationType;
    name: string;
}

export interface ICollectFilesForOptimizationRequest {}
export interface ICollectFilesForOptimizationResponse extends IResponse {}