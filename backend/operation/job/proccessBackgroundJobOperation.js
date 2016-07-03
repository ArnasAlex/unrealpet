var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var operation = require('../base/operation');
var jobDataEntity = require('../../entities/jobDataEntity');
var optimizePicOp = require('./optimizePictureOperation');
var ProcessBackgroundJobOperation = (function (_super) {
    __extends(ProcessBackgroundJobOperation, _super);
    function ProcessBackgroundJobOperation() {
        _super.apply(this, arguments);
    }
    ProcessBackgroundJobOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.getJob.bind(this),
            this.processJob.bind(this),
            this.updateJobStatus.bind(this)
        ], this.respond.bind(this, cb));
    };
    ProcessBackgroundJobOperation.prototype.getJob = function (next) {
        var query = this.makeJobQuery();
        var updateStatement = this.makeUpdateJobStatement();
        var sort = [['status', 1]];
        var options = { new: true };
        this.db.collection(jobDataEntity.CollectionName).findAndModify(query, sort, updateStatement, options, function (err, res) {
            var job = res ? res.value : null;
            next(err, job);
        });
    };
    ProcessBackgroundJobOperation.prototype.makeJobQuery = function () {
        var tooLongLockDate = new Date();
        tooLongLockDate.setMinutes(tooLongLockDate.getMinutes() - ProcessBackgroundJobOperation.minutesToLock);
        var query = {
            $or: [
                { status: 1 },
                { status: 2, start: { $lt: tooLongLockDate } },
                { status: 4, failCount: { $lt: ProcessBackgroundJobOperation.maxFailCount } }
            ]
        };
        return query;
    };
    ProcessBackgroundJobOperation.prototype.makeUpdateJobStatement = function () {
        var now = new Date();
        var update = {
            $set: {
                start: now,
                status: 2,
                updatedOn: now
            }
        };
        return update;
    };
    ProcessBackgroundJobOperation.prototype.processJob = function (job, next) {
        if (!job) {
            next(null, job, false);
            return;
        }
        var operation = this.getJobProcessingOperation(job);
        if (!operation) {
            var err = 'Background job operation for job type was not found. Job type: ' + job.type;
            this.logError(err);
            next(err);
            return;
        }
        this.executeSpecificJobOperation(operation, job, next);
    };
    ProcessBackgroundJobOperation.prototype.executeSpecificJobOperation = function (operation, job, next) {
        operation.execute(function (response) {
            next(null, job, !response.error);
        });
    };
    ProcessBackgroundJobOperation.prototype.updateJobStatus = function (job, jobExecutionSuccess, next) {
        if (!job) {
            next(null, false);
            return;
        }
        job.updatedOn = new Date();
        if (jobExecutionSuccess) {
            job.end = new Date();
            job.status = 3;
        }
        else {
            job.status = 4;
            job.failCount = job.failCount ? job.failCount + 1 : 1;
        }
        this.save(jobDataEntity.CollectionName, job, function (err, res) {
            next(err, true);
        });
    };
    ProcessBackgroundJobOperation.prototype.getJobProcessingOperation = function (job) {
        switch (job.type) {
            case 1:
                return new optimizePicOp.OptimizePictureOperation(job);
        }
    };
    ProcessBackgroundJobOperation.prototype.respond = function (cb, err, hasWorked) {
        var response = { error: err, hasWorked: hasWorked };
        cb(response);
    };
    ProcessBackgroundJobOperation.minutesToLock = 10;
    ProcessBackgroundJobOperation.maxFailCount = 5;
    return ProcessBackgroundJobOperation;
})(operation.Operation);
exports.ProcessBackgroundJobOperation = ProcessBackgroundJobOperation;
//# sourceMappingURL=proccessBackgroundJobOperation.js.map