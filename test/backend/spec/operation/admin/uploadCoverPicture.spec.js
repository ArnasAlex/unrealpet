/// <reference path="../../../typings/refs.d.ts" />
var uploadOp = require('../../../../../backend/operation/admin/uploadCoverPictureOperation');
var mocker = require('../../../helper/operationMocker');
describe('Upload cover picture', function () {
    var req;
    var op;
    var mock;
    var spyUpload;
    var spyOptimize;
    beforeEach(function () {
        req = {};
        op = new uploadOp.UploadCoverPictureOperation(req);
        mock = mocker.OperationMocker.mock(op);
        spyUpload = spyOn(op, 'upload');
        spyUpload.and.callFake(function (next) {
            next(null, 'coverUploaded.png');
        });
        spyOptimize = spyOn(op, 'executeOptimization');
        spyOptimize.and.callFake(function (notOptimizedPath, optimizedPath, resizeFunc, next) {
            next(null);
        });
    });
    it('uploads file to disk', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(spyUpload.calls.count()).toEqual(1);
            done();
        });
    });
    it('optimizes picture', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            var notOptimized = './uploads/c/coverUploaded.png';
            var optimized = './uploads/c/cover.jpeg';
            expect(spyOptimize).toHaveBeenCalledWith(notOptimized, optimized, jasmine.any(Function), jasmine.any(Function));
            done();
        });
    });
});
//# sourceMappingURL=uploadCoverPicture.spec.js.map