/// <reference path="../../../typings/refs.d.ts" />
var removeFileOp = require('../../../../../backend/operation/general/removeFileOperation');
describe('Remove file', function () {
    var req;
    var op;
    var filePath = '/some/path/to/testPic.jpg';
    beforeEach(function () {
        req = {
            filePath: filePath
        };
        op = new removeFileOp.RemoveFileOperation(req);
    });
    it('removes file if exists', function (done) {
        var spyExists = spyOn(op, 'fsExists');
        spyExists.and.callFake(function (path, next) {
            next(null, true);
        });
        var spyUnlink = spyOn(op, 'fsUnlink');
        spyUnlink.and.callFake(function (path, next) {
            next(null);
        });
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(spyExists).toHaveBeenCalledWith(filePath, jasmine.any(Function));
            expect(spyUnlink).toHaveBeenCalledWith(filePath, jasmine.any(Function));
            done();
        });
    });
});
//# sourceMappingURL=removeFile.spec.js.map