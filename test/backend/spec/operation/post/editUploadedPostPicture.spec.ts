/// <reference path="../../../typings/refs.d.ts" />
import editPic = require('../../../../../backend/operation/post/editUploadedPostPictureOperation');
import mocker = require('../../../helper/operationMocker');

describe('Edit uploaded post picture',() => {
    var req: IEditPictureRequest;
    var op: editPic.EditUploadedPostPictureOperation;
    var mock: mocker.IMockedOperation;
    var spyExecution: jasmine.Spy;
    var spyFindOne: jasmine.Spy;
    var spyRotate: jasmine.Spy;

    beforeEach(() => {
        req = {
            url: '/uploads/url/pic.png',
            action: PictureEditAction.RotateLeft,
            accountId: mocker.OperationMocker.getId().toString()
        };
        op = new editPic.EditUploadedPostPictureOperation(req);
        mock = mocker.OperationMocker.mock(op);

        spyExecution = spyOn(op, 'executeOptimization');
        spyExecution.and.callFake((picturePath, editMethod, next) => {
            var gmFake = {rotate: () => {}};
            spyRotate = spyOn(gmFake, 'rotate');
            editMethod(gmFake);
            next(null);
        });
    });

    it('rotates image', (done) => {
        op.execute((response: ITogglePostPawResponse) => {
            expect(response.error).toBeNull();
            expect(spyRotate).toHaveBeenCalledWith('black', -90);
            expect(spyExecution).toHaveBeenCalledWith('.' + req.url, jasmine.any(Function), jasmine.any(Function));
            done();
        });
    });
});