/// <reference path="../../../typings/refs.d.ts" />
var processOp = require('../../../../../backend/operation/job/proccessBackgroundJobOperation');
var job = require('../../../../../backend/entities/jobDataEntity');
var mocker = require('../../../helper/operationMocker');
describe('Process background job', function () {
    var req;
    var op;
    var mock;
    var existingJob;
    var spyExecutionSpecJob;
    beforeEach(function () {
        req = {};
        op = new processOp.ProcessBackgroundJobOperation(req);
        mock = mocker.OperationMocker.mock(op);
        spyExecutionSpecJob = spyOn(op, 'executeSpecificJobOperation');
        spyExecutionSpecJob.and.callFake(function (operation, job, next) {
            next(null, job, true);
        });
        existingJob = new job.JobDataEntity();
        existingJob.type = 1;
    });
    it('returns hasWorked false if no available jobs were found', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.hasWorked).toBeFalsy();
            done();
        });
    });
    it('processes job if job was found', function (done) {
        mock.collectionMock.findAndModify = function (query, sort, update, options, cb) {
            cb(null, { value: existingJob });
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.hasWorked).toBeTruthy();
            done();
        });
    });
    it('executes operation for specific job', function (done) {
        mock.collectionMock.findAndModify = function (query, sort, update, options, cb) {
            cb(null, { value: existingJob });
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(spyExecutionSpecJob).toHaveBeenCalled();
            done();
        });
    });
    it('saves success status for processed job', function (done) {
        mock.collectionMock.findAndModify = function (query, sort, update, options, cb) {
            cb(null, { value: existingJob });
        };
        var savedJob;
        mock.collectionMock.save = function (doc, cb) {
            savedJob = doc;
            cb(null);
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.hasWorked).toBeTruthy();
            expect(savedJob.status).toEqual(3);
            done();
        });
    });
    it('saves fail status and increases fail count for erroneous job', function (done) {
        mock.collectionMock.findAndModify = function (query, sort, update, options, cb) {
            existingJob.failCount = 2;
            cb(null, { value: existingJob });
        };
        var savedJob;
        mock.collectionMock.save = function (doc, cb) {
            savedJob = doc;
            cb(null);
        };
        spyExecutionSpecJob.and.callFake(function (operation, job, next) {
            next(null, job, false);
        });
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.hasWorked).toBeTruthy();
            expect(savedJob.status).toEqual(4);
            expect(savedJob.failCount).toEqual(3);
            done();
        });
    });
});
//# sourceMappingURL=proccessBackgroundJob.spec.js.map