/// <reference path="../../typings/refs.d.ts" />
import fs = require('fs');
import path = require('path');
import operation = require('../base/operation');
import jobDataEntity = require('../../entities/jobDataEntity');
import constants = require('../../core/constants');
import postEntity = require('../../entities/postEntity');
import accountEntity = require('../../entities/accountEntity');

export class FileCleanupOpration extends operation.Operation {
    protected request: IFileCleanupRequest;

    private expirationTimeMs = 1000 * 60 * 60; // 1h
    private fileBatchCount = 50;

    public execute(cb: (response: IFileCleanupResponse) => void) {
        this.async.waterfall([
                this.getFiles,
                this.filterOldFiles,
                this.checkUsagesInDatabase,
                this.clean
            ],
            this.respond.bind(this, cb));
    }

    private getFiles = (next) => {
        this.async.map(
            [
                constants.Constants.getPictureUploadFolder(),
                constants.Constants.getVideoUploadFolder()
            ],
            this.getFilesWithFullPath,
            (err, result: string[][]) => {
                if (err){
                    throw Error(err.toString());
                }

                var files = this.matrixToArray(result);
                files = this._.take(files, this.fileBatchCount);
                next(err, files);
            }
        );
    };

    private filterOldFiles = (files: string[], next) => {
        var now = new Date().getTime();
        this.async.map(files, this.fsStat, (err, results: IFsStatResult[]) => {
            var filteredFileStats = this._.filter(results, (fileStat: IFsStatResult) => {
                var endTime = fileStat.stat.ctime.getTime() + this.expirationTimeMs;
                return now > endTime;
            });

            var filteredFiles = this._.map(filteredFileStats, stats => stats.file);
            next(err, filteredFiles);
        });
    };

    private checkUsagesInDatabase = (files: string[], next) => {
        if (files.length === 0){
            next(null, files);
            return;
        }

        var databasePicturesSchema = this.getDatabasePicturesSchema();
        this.async.map(
            databasePicturesSchema.collections,
            (collection, cb) => { this.findInDatabase(collection, files, cb); },
            (err, results: string[][]) => {
                var filesFound = this.matrixToArray(results);
                if (filesFound.length > 0){
                    this.logError('Found unoptimized files that should be already optimized: '
                        + filesFound.join(', '), ErrorType.Warning);
                }

                var notFoundFiles = this._.difference(files, filesFound);
                next(err, notFoundFiles);
            }
        );
    };

    private findInDatabase = (collection: IPictureDatabaseCollection, files: string[], cb) => {
        var urls = this._.map(files, file => constants.Constants.getUrlFromFilePath(file));

        var query = {$or: []};
        collection.fields.forEach((field) => {
            var queryPart = {};
            queryPart[field] = {$in: urls};
            query.$or.push(queryPart);
        });

        this.db.collection(collection.name).find(query).toArray((err, records) => {
            var foundUrls = [];
            records.forEach((record) => {
               collection.fields.forEach((field) => {
                  var url = record[field];
                  if (urls.indexOf(url) !== -1){
                      foundUrls.push(url);
                  }
               });
            });

            var files = this._.map(foundUrls, url => constants.Constants.getFilePathFromUrl(url));
            cb(err, files);
        });
    };

    private clean = (files: string[], next) => {
        this.async.map(files, this.fsUnlink, (err, result) => {
            next(err, files.length > 0);
        });
    };

    private fsUnlink = (filePath: string, cb) => {
        fs.unlink(filePath, cb);
    };

    private matrixToArray(matrix: string[][]){
        var result: string[] = [];
        matrix.forEach((stringArr: string[]) => {
            stringArr.forEach((str: string) => {
                result.push(str);
            })
        });

        return result;
    }

    private getFilesWithFullPath = (dir: string, cb) => {
        this.fsReadDir(dir, (err, files) => {
            var filesWithPath = this._.map(files, (file: string) => {
                return dir + file;
            });
            cb(err, filesWithPath);
        });
    };

    private fsReadDir = (dir: string, cb) => {
        fs.readdir(dir, cb);
    };

    private fsStat = (file: string, cb) => {
        fs.stat(file, (err, stat: fs.Stats) => {
            var result: IFsStatResult = {
                file: file,
                stat: stat
            };
            cb(err, result);
        });
    };

    private getDatabasePicturesSchema = (): IPictureDatabaseSchema => {
        var post: IPictureDatabaseCollection = {
            name: postEntity.CollectionName,
            fields: ['pictureUrl']
        };

        var account: IPictureDatabaseCollection = {
            name: accountEntity.CollectionName,
            fields: ['logo', 'picture']
        };

        var schema: IPictureDatabaseSchema = {
            collections: [post, account]
        };

        return schema;
    };

    private respond(cb: (response: IFileCleanupResponse) => void, err, haveWorked: boolean) {
        var response: IFileCleanupResponse = {
            error: err,
            haveWorked: haveWorked
        };
        cb(response);
    }
}

export interface IFileCleanupRequest {}
export interface IFileCleanupResponse extends IResponse {
    haveWorked: boolean;
}

interface IPictureDatabaseSchema {
    collections: IPictureDatabaseCollection[];
}

interface IPictureDatabaseCollection {
    name: string;
    fields: string[];
}

interface IFsStatResult{
    stat: fs.Stats;
    file: string;
}