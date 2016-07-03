/// <reference path="../../typings/refs.d.ts" />
import fs = require('fs');
import fse = require('fs-extra');
import path = require('path');
import gm = require('gm');
import operation = require('../base/operation');
import jobDataEntity = require('../../entities/jobDataEntity');
import postEntity = require('../../entities/postEntity');
import accountEntity = require('../../entities/accountEntity');
import constants = require('../../core/constants');
var mkdirp = require('mkdirp');

export class OptimizePictureOperation extends operation.Operation {
    protected request: jobDataEntity.JobDataEntity;

    private static optimizePathExists = false;
    private optimizationTypeValues: IFileOptimizeTypeValues;

    public execute(cb: (response: IOptimizePictureResponse) => void) {
        this.async.waterfall([
                this.ensureOptimizeFolderExists.bind(this),
                this.optimize.bind(this),
                this.updateUrls.bind(this)
            ],
            this.respond.bind(this, cb));
    }

    private ensureOptimizeFolderExists(next) {
        if (!OptimizePictureOperation.optimizePathExists){
            mkdirp(constants.Constants.getOptimizedPictureFolder(), (err) => {
                if (err){
                    this.logError('Failed to check or create optimized picture folder: ' + err);
                }
                else{
                    OptimizePictureOperation.optimizePathExists = true;
                }

                next(err);
            });
        }
        else{
            next();
        }
    }

    private optimize(next) {
        var data: jobDataEntity.IFileOptimizationJobData = this.request.data;
        this.optimizationTypeValues = this.getOptimizationTypeValues(data.type);

        var notOptimizedFile = this.getNotOptimizedFilePath(data);
        var optimizedFile = this.getOptimizedFilePath(data);

        if (data.type == jobDataEntity.FileOptimizationType.PostVideo){
            this.optimizeVideo(notOptimizedFile, optimizedFile, next);
            return;
        }

        this.optimizePicture(notOptimizedFile, optimizedFile, next);
    }

    private optimizePicture(notOptimizedFile: string, optimizedFile: string, next){
        var options: IPictureOptimizeTypeValues = <any>this.optimizationTypeValues;
        this.executeOptimization(notOptimizedFile, optimizedFile, options.resize, options.addLogo(), next);
    }

    private optimizeVideo(source: string, destination: string, next){
        var coverSource = constants.Constants.changeFileExtension(source, constants.Constants.defaultPictureExtension);
        var coverDestination = constants.Constants.changeFileExtension(destination, constants.Constants.defaultPictureExtension);
        this.copyFile(source, destination, (err) => {
            if (!err){
                this.copyFile(coverSource, coverDestination, next);
                return;
            }
            next(err);
        });
    }

    private copyFile(sourceFile: string, destinationFile: string, next){
        fse.copy(sourceFile, destinationFile, (err) => {
            if (err) {
                this.logError('Failed to copy file source: ' + sourceFile
                    + ' destination: ' + destinationFile
                    + ' err: ' + err);
                next(this.defaultErrorMsg());
                return;
            }

            next();
        });
    }

    private getResizeFunc(type: jobDataEntity.FileOptimizationType): (gmState: gm.State) => gm.State {
        if (type === jobDataEntity.FileOptimizationType.PostPicture){
            return (gmState: gm.State) => { return gmState.resize(640, null, '>'); }
        }
        else if (type === jobDataEntity.FileOptimizationType.AccountLogo){
            return (gmState: gm.State) => { return gmState.resize(50, 50, '!'); }
        }

        throw Error('Not recognized job optimization type for resize function: ' + type);
    }

    private executeOptimization(notOptimizedPath, optimizedPath, resizeFunc: (gmState: gm.State) => gm.State, addLogo: boolean, next){
        var gmState = gm(notOptimizedPath);
        gmState = resizeFunc(gmState);

        if (addLogo){
            gmState = constants.Constants.addLogoToGmState(gmState);
        }

        gmState
            .strip()
            .write(optimizedPath, (err) => {
                next(err);
            });
    }

    private getNotOptimizedFilePath(fileInfo: jobDataEntity.IFileOptimizationJobData){
        var folder = this.optimizationTypeValues.uploadFolder();
        var filePath = path.join(folder, fileInfo.name);
        return filePath;
    }

    private getOptimizedFilePath(fileInfo: jobDataEntity.IFileOptimizationJobData){
        var optimizedFolder = this.optimizationTypeValues.optimizedUploadFolder();
        var fileName = this.optimizationTypeValues.optimizedFileName(fileInfo.name);

        var filePath = path.join(optimizedFolder, fileName);
        return filePath;
    }

    private updateUrls(next) {
        var urlToReplace = this.getUrlToReplace();
        var newUrl = this.getNewUrl();

        var query = {};
        query[this.optimizationTypeValues.fileFieldName()] = urlToReplace;

        var updateObj = {};
        updateObj[this.optimizationTypeValues.fileFieldName()] = newUrl;
        var update = {$set: updateObj};

        var collectionName = this.optimizationTypeValues.collectionName();
        this.update(collectionName, query, update, next);
    }

    private getUrlToReplace() {
        var fileData: jobDataEntity.IFileOptimizationJobData = this.request.data;
        var fileName = fileData.name;
        var folderUrl = this.optimizationTypeValues.uploadFolderUrl();

        var url = folderUrl + fileName;
        return url;
    }

    private getNewUrl() {
        var fileData: jobDataEntity.IFileOptimizationJobData = this.request.data;
        var fileName = this.optimizationTypeValues.optimizedFileName(fileData.name);
        var folderUrl = this.optimizationTypeValues.optimizedFolderUrl();

        var url = folderUrl + fileName;
        return url;
    }

    private getOptimizationTypeValues(type: jobDataEntity.FileOptimizationType): IFileOptimizeTypeValues{
        switch(type){
            case jobDataEntity.FileOptimizationType.AccountLogo:
                return new AccountLogoTypeValues();
            case jobDataEntity.FileOptimizationType.AccountMainPicture:
                return new AccountMainPictureTypeValues();
            case jobDataEntity.FileOptimizationType.PostPicture:
                return new PostPictureTypeValues();
            case jobDataEntity.FileOptimizationType.PostVideo:
                return new PostVideoTypeValues();
        }

        throw Error('Invalid file optimization type: ' + type);
    }

    private respond(cb: (response: IOptimizePictureResponse) => void, err) {
        if (err){
            this.logError('Error on optimizing picture: ' + err);
        }

        var response: IOptimizePictureResponse = {error: err};
        cb(response);
    }
}

export interface IOptimizePictureResponse extends IResponse {}

interface IFileOptimizeTypeValues {
    optimizedFolderUrl(): string;
    uploadFolderUrl(): string;
    uploadFolder(): string;
    optimizedUploadFolder(): string;
    optimizedFileName(originalFileName: string): string;
    collectionName(): string;
    fileFieldName(): string;
}

interface IPictureOptimizeTypeValues extends IFileOptimizeTypeValues {
    resize(gmState: gm.State): gm.State;
    addLogo(): boolean;
}

class PostVideoTypeValues implements IFileOptimizeTypeValues {
    optimizedFolderUrl() {
        return constants.Constants.videoOptimizedFolderUrl;
    }

    uploadFolderUrl() {
        return constants.Constants.videoUploadFolderUrl;
    }

    uploadFolder() {
        return constants.Constants.getVideoUploadFolder();
    }

    optimizedUploadFolder() {
        return constants.Constants.getOptimizedVideoFolder();
    }

    optimizedFileName(original: string) {
        return original;
    }

    collectionName(){
        return postEntity.CollectionName;
    }

    fileFieldName() {
        return 'pictureUrl';
    }
}

class PictureTypeValues implements IPictureOptimizeTypeValues {
    optimizedFolderUrl() {
        return constants.Constants.pictureOptimizedFolderUrl;
    }

    uploadFolderUrl() {
        return constants.Constants.pictureUploadFolderUrl;
    }

    uploadFolder() {
        return constants.Constants.getPictureUploadFolder();
    }

    optimizedUploadFolder() {
        return constants.Constants.getOptimizedPictureFolder();
    }

    optimizedFileName(original: string) {
        var fileName = original;
        if (fileName.indexOf('jpeg') === -1 && fileName.indexOf('jpg') === -1){
            fileName = constants.Constants.changeFileExtension(fileName, constants.Constants.defaultPictureExtension);
        }

        return fileName;
    }

    collectionName(): string {
        throw Error('Set collection name');
    }

    fileFieldName(): string {
        throw Error('Set field name');
    }

    addLogo(): boolean{
        throw Error('implement addLogo');
    }

    resize(gmState: gm.State): gm.State{
        throw Error('implement resize');
    }
}

class PostPictureTypeValues extends PictureTypeValues {
    resize(gmState: gm.State){
        return gmState.resize(640, null, '>');
    }

    collectionName(){
        return postEntity.CollectionName;
    }

    fileFieldName() {
        return 'pictureUrl';
    }

    addLogo(): boolean{
        return true;
    }
}

class AccountLogoTypeValues extends PictureTypeValues {
    resize(gmState: gm.State){
        return gmState.resize(50, 50, '!');
    }

    collectionName(){
        return accountEntity.CollectionName;
    }

    fileFieldName() {
        return 'logo';
    }

    addLogo(): boolean{
        return false;
    }
}

class AccountMainPictureTypeValues extends PictureTypeValues {
    resize(gmState: gm.State){
        return gmState.resize(640, null, '>');
    }

    collectionName(){
        return accountEntity.CollectionName;
    }

    fileFieldName() {
        return 'picture';
    }

    addLogo(): boolean{
        return true;
    }
}