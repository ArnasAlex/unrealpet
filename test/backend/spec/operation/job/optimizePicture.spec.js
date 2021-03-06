/// <reference path="../../../typings/refs.d.ts" />
var optimizeOp = require('../../../../../backend/operation/job/optimizePictureOperation');
var job = require('../../../../../backend/entities/jobDataEntity');
var mocker = require('../../../helper/operationMocker');
describe('Optimize picture', function () {
    var req;
    var op;
    var mock;
    var spyCopyFile;
    var spyOptimization;
    var resizeFunc;
    var addLogo;
    beforeEach(function () {
        req = new job.JobDataEntity();
        req.type = 1;
        req.data = {
            name: 'testFile.jpg',
            type: 1
        };
        op = new optimizeOp.OptimizePictureOperation(req);
        mock = mocker.OperationMocker.mock(op);
        setSpies(op);
    });
    var setSpies = function (operation) {
        spyOn(operation, 'ensureOptimizeFolderExists').and.callFake(function (next) {
            next();
        });
        spyOptimization = spyOn(operation, 'executeOptimization');
        spyOptimization.and.callFake(function (path, optiPath, resize, addLogoVal, next) {
            resizeFunc = resize;
            addLogo = addLogoVal;
            next();
        });
        spyCopyFile = spyOn(operation, 'copyFile');
        spyCopyFile.and.callFake(function (source, destination, next) {
            next();
        });
    };
    it('executes optimization with old and optimized file paths', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            var notOptimized = 'uploads\\pictures\\testFile.jpg';
            var optimized = 'uploads\\o\\testFile.jpg';
            var anyFunc = jasmine.any(Function);
            expect(spyOptimization).toHaveBeenCalledWith(notOptimized, optimized, anyFunc, true, anyFunc);
            expect(spyCopyFile).not.toHaveBeenCalled();
            done();
        });
    });
    it('updates posts with optimized url', function (done) {
        var oldUrl, newUrl, collectionName;
        spyOn(op, 'update').and.callFake(function (collection, query, update, cb) {
            collectionName = collection;
            oldUrl = query.pictureUrl;
            newUrl = update.$set.pictureUrl;
            cb(null);
        });
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(oldUrl).toEqual('/uploads/pictures/testFile.jpg');
            expect(newUrl).toEqual('/uploads/o/testFile.jpg');
            expect(collectionName).toEqual('post');
            expect(addLogo).toEqual(true);
            done();
        });
    });
    it('updates accounts logo with optimized url', function (done) {
        req.data.type = 2;
        op = new optimizeOp.OptimizePictureOperation(req);
        mock = mocker.OperationMocker.mock(op);
        setSpies(op);
        var oldUrl, newUrl, collectionName;
        spyOn(op, 'update').and.callFake(function (collection, query, update, cb) {
            collectionName = collection;
            oldUrl = query.logo;
            newUrl = update.$set.logo;
            cb(null);
        });
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(oldUrl).toEqual('/uploads/pictures/testFile.jpg');
            expect(newUrl).toEqual('/uploads/o/testFile.jpg');
            expect(collectionName).toEqual('account');
            expect(addLogo).toEqual(false);
            done();
        });
    });
    it('updates accounts main picture with optimized url', function (done) {
        req.data.type = 4;
        op = new optimizeOp.OptimizePictureOperation(req);
        mock = mocker.OperationMocker.mock(op);
        setSpies(op);
        var oldUrl, newUrl, collectionName;
        spyOn(op, 'update').and.callFake(function (collection, query, update, cb) {
            collectionName = collection;
            oldUrl = query.picture;
            newUrl = update.$set.picture;
            cb(null);
        });
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(oldUrl).toEqual('/uploads/pictures/testFile.jpg');
            expect(newUrl).toEqual('/uploads/o/testFile.jpg');
            expect(collectionName).toEqual('account');
            expect(addLogo).toEqual(true);
            done();
        });
    });
    it('changes optimized file extension to jpeg', function (done) {
        req.data.name = 'pngFile.png';
        op = new optimizeOp.OptimizePictureOperation(req);
        mock = mocker.OperationMocker.mock(op);
        setSpies(op);
        var oldUrl, newUrl, collectionName;
        spyOn(op, 'update').and.callFake(function (collection, query, update, cb) {
            collectionName = collection;
            oldUrl = query.pictureUrl;
            newUrl = update.$set.pictureUrl;
            cb(null);
        });
        op.execute(function (response) {
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
    it('executes file copy for video and video cover', function (done) {
        req = new job.JobDataEntity();
        req.type = 1;
        req.data = {
            name: 'testFile.mp4',
            type: 3
        };
        op = new optimizeOp.OptimizePictureOperation(req);
        mock = mocker.OperationMocker.mock(op);
        setSpies(op);
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(spyCopyFile.calls.count()).toEqual(2);
            var firstCallArgs = spyCopyFile.calls.argsFor(0);
            expect(firstCallArgs[0]).toEqual('uploads\\videos\\testFile.mp4');
            expect(firstCallArgs[1]).toEqual('uploads\\v\\testFile.mp4');
            expect(spyOptimization).not.toHaveBeenCalled();
            done();
        });
    });
});
//# sourceMappingURL=optimizePicture.spec.js.map