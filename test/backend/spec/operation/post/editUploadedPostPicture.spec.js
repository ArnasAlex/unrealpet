/// <reference path="../../../typings/refs.d.ts" />
var editPic = require('../../../../../backend/operation/post/editUploadedPostPictureOperation');
var mocker = require('../../../helper/operationMocker');
describe('Edit uploaded post picture', function () {
    var req;
    var op;
    var mock;
    var spyExecution;
    var spyFindOne;
    var spyRotate;
    beforeEach(function () {
        req = {
            url: '/uploads/url/pic.png',
            action: 1,
            accountId: mocker.OperationMocker.getId().toString()
        };
        op = new editPic.EditUploadedPostPictureOperation(req);
        mock = mocker.OperationMocker.mock(op);
        spyExecution = spyOn(op, 'executeOptimization');
        spyExecution.and.callFake(function (picturePath, editMethod, next) {
            var gmFake = { rotate: function () { } };
            spyRotate = spyOn(gmFake, 'rotate');
            editMethod(gmFake);
            next(null);
        });
    });
    it('rotates image', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(spyRotate).toHaveBeenCalledWith('black', -90);
            expect(spyExecution).toHaveBeenCalledWith('.' + req.url, jasmine.any(Function), jasmine.any(Function));
            done();
        });
    });
});
//# sourceMappingURL=editUploadedPostPicture.spec.js.map