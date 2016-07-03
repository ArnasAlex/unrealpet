/// <reference path="../../../typings/refs.d.ts" />
import removeFileOp = require('../../../../../backend/operation/general/removeFileOperation');
import mocker = require('../../../helper/operationMocker');
import cons = require('../../../../../backend/core/constants');

describe('Remove file',() => {
    var req: removeFileOp.IRemoveFileRequest;
    var op: removeFileOp.RemoveFileOperation;
    var filePath = '/some/path/to/testPic.jpg';

    beforeEach(() => {
        req = {
            filePath: filePath
        };
        op = new removeFileOp.RemoveFileOperation(req);
    });

    it('removes file if exists', (done) => {
        var spyExists = spyOn(op, 'fsExists');
        spyExists.and.callFake((path, next) => {
            next(null, true);
        });

        var spyUnlink = spyOn(op, 'fsUnlink');
        spyUnlink.and.callFake((path, next) => {
            next(null);
        });

        op.execute((response: IRemoveAccountPictureResponse) => {
            expect(response.error).toBeNull();
            expect(spyExists).toHaveBeenCalledWith(filePath, jasmine.any(Function));
            expect(spyUnlink).toHaveBeenCalledWith(filePath, jasmine.any(Function));
            done();
        });
    });
});