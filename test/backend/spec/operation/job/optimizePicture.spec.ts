/// <reference path="../../../typings/refs.d.ts" />
import optimizeOp = require('../../../../../backend/operation/job/optimizePictureOperation');
import job = require('../../../../../backend/entities/jobDataEntity');
import mocker = require('../../../helper/operationMocker');

describe('Optimize picture',() => {
    var req: job.JobDataEntity;
    var op: optimizeOp.OptimizePictureOperation;
    var mock: mocker.IMockedOperation;
    var spyCopyFile: jasmine.Spy;
    var spyOptimization: jasmine.Spy;
    var resizeFunc;
    var addLogo: boolean;

    beforeEach(() => {
        req = new job.JobDataEntity();
        req.type = job.JobType.FileOptimization;
        req.data = <job.IFileOptimizationJobData>{
            name: 'testFile.jpg',
            type: job.FileOptimizationType.PostPicture
        };

        op = new optimizeOp.OptimizePictureOperation(req);
        mock = mocker.OperationMocker.mock(op);
        setSpies(op);
    });

    var setSpies = function(operation){
        spyOn(operation, 'ensureOptimizeFolderExists').and.callFake((next) => {
            next();
        });

        spyOptimization = spyOn(operation, 'executeOptimization');
        spyOptimization.and.callFake((path, optiPath, resize, addLogoVal, next)=> {
            resizeFunc = resize;
            addLogo = addLogoVal;
            next();
        });

        spyCopyFile = spyOn(operation, 'copyFile');
        spyCopyFile.and.callFake((source, destination, next) => {
            next();
        });
    };

    it('executes optimization with old and optimized file paths', (done) => {
        op.execute((response: optimizeOp.IOptimizePictureResponse) => {
            expect(response.error).toBeNull();
            var notOptimized = 'uploads\\pictures\\testFile.jpg';
            var optimized = 'uploads\\o\\testFile.jpg';
            var anyFunc = jasmine.any(Function);
            expect(spyOptimization).toHaveBeenCalledWith(notOptimized, optimized, anyFunc, true, anyFunc);
            expect(spyCopyFile).not.toHaveBeenCalled();
            done();
        });
    });

    it('updates posts with optimized url', (done) => {
        var oldUrl, newUrl, collectionName;
        spyOn(op, 'update').and.callFake((collection, query, update, cb) => {
            collectionName = collection;
            oldUrl = query.pictureUrl;
            newUrl = update.$set.pictureUrl;
            cb(null);
        });

        op.execute((response: optimizeOp.IOptimizePictureResponse) => {
            expect(response.error).toBeNull();
            expect(oldUrl).toEqual('/uploads/pictures/testFile.jpg');
            expect(newUrl).toEqual('/uploads/o/testFile.jpg');
            expect(collectionName).toEqual('post');
            expect(addLogo).toEqual(true);
            done();
        });
    });

    it('updates accounts logo with optimized url', (done) => {
        req.data.type = job.FileOptimizationType.AccountLogo;
        op = new optimizeOp.OptimizePictureOperation(req);
        mock = mocker.OperationMocker.mock(op);
        setSpies(op);

        var oldUrl, newUrl, collectionName;
        spyOn(op, 'update').and.callFake((collection, query, update, cb) => {
            collectionName = collection;
            oldUrl = query.logo;
            newUrl = update.$set.logo;
            cb(null);
        });

        op.execute((response: optimizeOp.IOptimizePictureResponse) => {
            expect(response.error).toBeNull();
            expect(oldUrl).toEqual('/uploads/pictures/testFile.jpg');
            expect(newUrl).toEqual('/uploads/o/testFile.jpg');
            expect(collectionName).toEqual('account');
            expect(addLogo).toEqual(false);
            done();
        });
    });

    it('updates accounts main picture with optimized url', (done) => {
        req.data.type = job.FileOptimizationType.AccountMainPicture;
        op = new optimizeOp.OptimizePictureOperation(req);
        mock = mocker.OperationMocker.mock(op);
        setSpies(op);

        var oldUrl, newUrl, collectionName;
        spyOn(op, 'update').and.callFake((collection, query, update, cb) => {
            collectionName = collection;
            oldUrl = query.picture;
            newUrl = update.$set.picture;
            cb(null);
        });

        op.execute((response: optimizeOp.IOptimizePictureResponse) => {
            expect(response.error).toBeNull();
            expect(oldUrl).toEqual('/uploads/pictures/testFile.jpg');
            expect(newUrl).toEqual('/uploads/o/testFile.jpg');
            expect(collectionName).toEqual('account');
            expect(addLogo).toEqual(true);
            done();
        });
    });

    it('changes optimized file extension to jpeg', (done) => {
        req.data.name = 'pngFile.png';
        op = new optimizeOp.OptimizePictureOperation(req);
        mock = mocker.OperationMocker.mock(op);
        setSpies(op);

        var oldUrl, newUrl, collectionName;
        spyOn(op, 'update').and.callFake((collection, query, update, cb) => {
            collectionName = collection;
            oldUrl = query.pictureUrl;
            newUrl = update.$set.pictureUrl;
            cb(null);
        });

        op.execute((response: optimizeOp.IOptimizePictureResponse) => {
            expect(response.error).toBeNull();
            expect(oldUrl).toEqual('/uploads/pictures/pngFile.png');
            expect(newUrl).toEqual('/uploads/o/pngFile.jpeg');

            var notOptimized = 'uploads\\pictures\\pngFile.png';
            var optimized = 'uploads\\o\\pngFile.jpeg';
            var anyFunc = jasmine.any(Function);
            expect(spyOptimization).toHaveBeenCalledWith(notOptimized, optimized, anyFunc, true, anyFunc);
            done();
        });
    });

    it('executes file copy for video and video cover', (done) => {
        req = new job.JobDataEntity();
        req.type = job.JobType.FileOptimization;
        req.data = <job.IFileOptimizationJobData>{
            name: 'testFile.mp4',
            type: job.FileOptimizationType.PostVideo
        };

        op = new optimizeOp.OptimizePictureOperation(req);
        mock = mocker.OperationMocker.mock(op);
        setSpies(op);

        op.execute((response: optimizeOp.IOptimizePictureResponse) => {
            expect(response.error).toBeNull();
            expect(spyCopyFile.calls.count()).toEqual(2);
            var firstCallArgs = spyCopyFile.calls.argsFor(0);
            expect(firstCallArgs[0]).toEqual('uploads\\videos\\testFile.mp4');//, 'uploads\\v\\testFile.mp4', jasmine.any(Function));
            expect(firstCallArgs[1]).toEqual('uploads\\v\\testFile.mp4');
            expect(spyOptimization).not.toHaveBeenCalled();
            done();
        });
    });
});