/// <reference path="../../typings/refs.d.ts" />
import fs = require('fs');
import operation = require('../base/operation');
import jobDataEntity = require('../../entities/jobDataEntity');
import constants = require('../../core/constants');
import optimizePicOp = require('./optimizePictureOperation');

export class ProcessBackgroundJobOperation extends operation.Operation {
    protected request: IProcessBackgroundJobRequest;
    private static minutesToLock = 10;
    private static maxFailCount = 5;

    public execute(cb: (response: IProcessBackgroundJobResponse) => void) {
        this.async.waterfall([
                this.getJob.bind(this),
                this.processJob.bind(this),
                this.updateJobStatus.bind(this)
            ],
            this.respond.bind(this, cb));
    }

    private getJob(next) {
        var query = this.makeJobQuery();
        var updateStatement = this.makeUpdateJobStatement();

        var sort = [['status', 1]];
        var options = {new: true};
        this.db.collection(jobDataEntity.CollectionName).findAndModify(
            query, sort, updateStatement, options, (err, res) => {
                var job = res ? res.value : null;
                next(err, job);
            });
    }

    private makeJobQuery(){
        var tooLongLockDate = new Date();
        tooLongLockDate.setMinutes(tooLongLockDate.getMinutes()-ProcessBackgroundJobOperation.minutesToLock);

        var query = {
            $or: [
                {status: jobDataEntity.JobDataStatus.Created},
                {status: jobDataEntity.JobDataStatus.InProgress, start: { $lt: tooLongLockDate }},
                {status: jobDataEntity.JobDataStatus.Fail, failCount: {$lt: ProcessBackgroundJobOperation.maxFailCount} }
            ]
        };

        return query;
    }

    private makeUpdateJobStatement() {
        var now = new Date();
        var update = {
            $set: {
                start: now,
                status: jobDataEntity.JobDataStatus.InProgress,
                updatedOn: now
            }
        };

        return update;
    }

    private processJob(job: jobDataEntity.JobDataEntity, next) {
        if (!job){
            next(null, job, false);
            return;
        }

        var operation = this.getJobProcessingOperation(job);
        if (!operation){
            var err ='Background job operation for job type was not found. Job type: ' + job.type;
            this.logError(err);
            next(err);
            return;
        }

        this.executeSpecificJobOperation(operation, job, next);
    }

    private executeSpecificJobOperation(operation: operation.Operation, job: jobDataEntity.JobDataEntity, next){
        operation.execute((response: IResponse) => {
            next(null, job, !response.error);
        });
    }

    private updateJobStatus(job: jobDataEntity.JobDataEntity, jobExecutionSuccess: boolean, next){
        if (!job){
            next(null, false);
            return;
        }

        job.updatedOn = new Date();
        if (jobExecutionSuccess){
            job.end = new Date();
            job.status = jobDataEntity.JobDataStatus.Success;
        }
        else{
            job.status = jobDataEntity.JobDataStatus.Fail;
            job.failCount = job.failCount ? job.failCount + 1 : 1;
        }

        this.save(jobDataEntity.CollectionName, job, (err, res) => {
            next(err, true);
        });
    }

    private getJobProcessingOperation(job: jobDataEntity.JobDataEntity): operation.Operation{
        switch (job.type){
            case jobDataEntity.JobType.FileOptimization:
                return new optimizePicOp.OptimizePictureOperation(job);
        }
    }

    private respond(cb: (response: IProcessBackgroundJobResponse) => void, err, hasWorked: boolean) {
        var response: IProcessBackgroundJobResponse = {error: err, hasWorked: hasWorked};
        cb(response);
    }
}

export interface IProcessBackgroundJobRequest {}
export interface IProcessBackgroundJobResponse extends IResponse {
    hasWorked: boolean;
}