/// <reference path="../../../typings/refs.d.ts" />
import uploadOp = require('../../../../../backend/operation/admin/uploadCoverPictureOperation');
import mocker = require('../../../helper/operationMocker');

describe('Upload cover picture',() => {
    var req: IUploadCoverPictureRequest;
    var op: uploadOp.UploadCoverPictureOperation;
    var mock: mocker.IMockedOperation;
    var spyUpload: jasmine.Spy;
    var spyOptimize: jasmine.Spy;

    beforeEach(() => {
        req = {};
        op = new uploadOp.UploadCoverPictureOperation(req);
        mock = mocker.OperationMocker.mock(op);

        spyUpload = spyOn(op, 'upload');
        spyUpload.and.callFake((next) => {
            next(null, 'coverUploaded.png');
        });

        spyOptimize = spyOn(op, 'executeOptimization');
        spyOptimize.and.callFake((notOptimizedPath, optimizedPath, resizeFunc, next) => {
            next(null);
        });
    });

    it('uploads file to disk', (done) => {
        op.execute((response: IUploadAccountPictureResponse) => {
            expect(response.error).toBeUndefined();
            expect(spyUpload.calls.count()).toEqual(1);
            done();
        });
    });

    it('optimizes picture', (done) => {
        op.execute((response: IUploadAccountPictureResponse) => {
            expect(response.error).toBeUndefined();
            var notOptimized = './uploads/c/coverUploaded.png';
            var optimized = './uploads/c/cover.jpeg';
            expect(spyOptimize).toHaveBeenCalledWith(notOptimized, optimized, jasmine.any(Function), jasmine.any(Function));
            done();
        });
    });
});