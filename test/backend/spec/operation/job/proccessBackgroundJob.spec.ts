/// <reference path="../../../typings/refs.d.ts" />
import processOp = require('../../../../../backend/operation/job/proccessBackgroundJobOperation');
import job = require('../../../../../backend/entities/jobDataEntity');
import mocker = require('../../../helper/operationMocker');

describe('Process background job',() => {
    var req: processOp.IProcessBackgroundJobRequest;
    var op: processOp.ProcessBackgroundJobOperation;
    var mock: mocker.IMockedOperation;
    var existingJob: job.JobDataEntity;
    var spyExecutionSpecJob: jasmine.Spy;

    beforeEach(() => {
        req = {};
        op = new processOp.ProcessBackgroundJobOperation(req);
        mock = mocker.OperationMocker.mock(op);

        spyExecutionSpecJob = spyOn(op, 'executeSpecificJobOperation');
        spyExecutionSpecJob.and.callFake((operation, job, next) => {
            next(null, job, true);
        });

        existingJob = new job.JobDataEntity();
        existingJob.type = job.JobType.FileOptimization;
    });

    it('returns hasWorked false if no available jobs were found', (done) => {
        op.execute((response: processOp.IProcessBackgroundJobResponse) => {
            expect(response.error).toBeNull();
            expect(response.hasWorked).toBeFalsy();
            done();
        });
    });

    it('processes job if job was found', (done) => {
        mock.collectionMock.findAndModify = (query, sort, update, options, cb) => {
            cb(null, {value: existingJob});
        };

        op.execute((response: processOp.IProcessBackgroundJobResponse) => {
            expect(response.error).toBeNull();
            expect(response.hasWorked).toBeTruthy();
            done();
        });
    });

    it('executes operation for specific job', (done) => {
        mock.collectionMock.findAndModify = (query, sort, update, options, cb) => {
            cb(null, {value: existingJob});
        };

        op.execute((response: processOp.IProcessBackgroundJobResponse) => {
            expect(response.error).toBeNull();
            expect(spyExecutionSpecJob).toHaveBeenCalled();
            done();
        });
    });

    it('saves success status for processed job', (done) => {
        mock.collectionMock.findAndModify = (query, sort, update, options, cb) => {
            cb(null, {value: existingJob});
        };

        var savedJob;
        mock.collectionMock.save = (doc, cb) => {
            savedJob = doc;
            cb(null);
        };

        op.execute((response: processOp.IProcessBackgroundJobResponse) => {
            expect(response.error).toBeNull();
            expect(response.hasWorked).toBeTruthy();
            expect(savedJob.status).toEqual(job.JobDataStatus.Success);
            done();
        });
    });

    it('saves fail status and increases fail count for erroneous job', (done) => {
        mock.collectionMock.findAndModify = (query, sort, update, options, cb) => {
            existingJob.failCount = 2;
            cb(null, {value: existingJob});
        };

        var savedJob;
        mock.collectionMock.save = (doc, cb) => {
            savedJob = doc;
            cb(null);
        };

        spyExecutionSpecJob.and.callFake((operation, job, next) => {
            next(null, job, false);
        });

        op.execute((response: processOp.IProcessBackgroundJobResponse) => {
            expect(response.error).toBeNull();
            expect(response.hasWorked).toBeTruthy();
            expect(savedJob.status).toEqual(job.JobDataStatus.Fail);
            expect(savedJob.failCount).toEqual(3);
            done();
        });
    });
});