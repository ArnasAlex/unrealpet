/// <reference path="../../../typings/refs.d.ts" />
import removeAcc = require('../../../../../backend/operation/account/removeAccountPictureOperation');
import acc = require('../../../../../backend/entities/accountEntity');
import mocker = require('../../../helper/operationMocker');

describe('Remove account picture',() => {
    var req: IRemoveAccountPictureRequest;
    var op: removeAcc.RemoveAccountPictureOperation;
    var mock: mocker.IMockedOperation;
    var removeFileSpy: jasmine.Spy;

    beforeEach(() => {
        req = {
            type: AccountPictures.Main,
            accountId: mocker.OperationMocker.getId().toString()
        };
        op = new removeAcc.RemoveAccountPictureOperation(req);
        mock = mocker.OperationMocker.mock(op);
        mock.collectionMock.findOne = (doc, cb) => {
            cb(null, {_id: doc._id, picture: '/some/url/testPic.jpg'});
        };

        removeFileSpy = spyOn(op, 'executeRemoveFileOperation');
        removeFileSpy.and.callFake((path, cb) => {
            cb(null);
        });
    });

    it('calls remove picture file operation', (done) => {
        op.execute((response: IRemoveAccountPictureResponse) => {
            expect(response.error).toBeNull();
            expect(removeFileSpy.calls.count()).toEqual(1);
            done();
        });
    });

    it('removes picture url in database', (done) => {
        var saveDoc;
        mock.collectionMock.save = (doc, cb) => {
            saveDoc = doc;
            cb(null);
        };

        op.execute((response: IRemoveAccountPictureResponse) => {
            expect(response.error).toBeNull();
            expect(saveDoc.picture).toBeNull();
            done();
        });
    });
});