/// <reference path="../../../typings/refs.d.ts" />
import uploadOp = require('../../../../../backend/operation/account/uploadAccountPictureOperation');
import mocker = require('../../../helper/operationMocker');
import acc = require('../../../../../backend/entities/accountEntity');

describe('Upload account picture',() => {
    var req: IUploadAccountPictureRequest;
    var op: uploadOp.UploadAccountPictureOperation;
    var mock: mocker.IMockedOperation;
    var removeFileSpy: jasmine.Spy;
    var uploadSpy: jasmine.Spy;
    var pictureUrl: string;
    var picType: AccountPictures;

    beforeEach(() => {
        pictureUrl = '/url/to/pic/testPic.jpg';
        picType = AccountPictures.Main;
        req = {
            expressRequest: {},
            expressResponse: {},
            accountId: mocker.OperationMocker.getId().toString()
        };
        op = new uploadOp.UploadAccountPictureOperation(req);
        mock = mocker.OperationMocker.mock(op);
        removeFileSpy = spyOn(op, 'executeRemoveFileOperation');
        removeFileSpy.and.callFake((path, cb) => {
            cb(null);
        });

        uploadSpy = spyOn(op, 'upload');
        uploadSpy.and.callFake((fileName: string, account, next) => {
            op['accountPictureType'] = picType;
            next(null, account, fileName);
        });
    });

    it('uploads file to disk', (done) => {
        op.execute((response: IUploadAccountPictureResponse) => {
            expect(response.error).toBeNull();
            expect(uploadSpy.calls.count()).toEqual(1);
            done();
        });
    });

    it('does not call remove operation if account has no picture assigned', (done) => {
        op.execute((response: IUploadAccountPictureResponse) => {
            expect(response.error).toBeNull();
            expect(removeFileSpy.calls.count()).toEqual(0);
            done();
        });
    });

    it('calls remove operation if account has picture assigned', (done) => {
        mock.collectionMock.findOne = (doc, cb) => {
            doc.picture = pictureUrl;
            cb(null, doc);
        };

        mock.collectionMock.save = (doc: acc.AccountEntity, cb) => {
            cb(null, pictureUrl, '/pic/to/remove');
        };

        op.execute((response: IUploadAccountPictureResponse) => {
            expect(response.error).toBeNull();
            expect(removeFileSpy.calls.count()).toEqual(1);
            done();
        });
    });

    it('updates account picture in database', (done) => {
        var newPictureUrl;
        mock.collectionMock.save = (doc: acc.AccountEntity, cb) => {
            newPictureUrl = doc.picture;
            cb(null);
        };
        op.execute((response: IUploadAccountPictureResponse) => {
            expect(response.error).toBeNull();
            expect(newPictureUrl).not.toEqual(pictureUrl);
            done();
        });
    });
});