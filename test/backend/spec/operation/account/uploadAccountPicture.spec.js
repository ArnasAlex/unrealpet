/// <reference path="../../../typings/refs.d.ts" />
var uploadOp = require('../../../../../backend/operation/account/uploadAccountPictureOperation');
var mocker = require('../../../helper/operationMocker');
describe('Upload account picture', function () {
    var req;
    var op;
    var mock;
    var removeFileSpy;
    var uploadSpy;
    var pictureUrl;
    var picType;
    beforeEach(function () {
        pictureUrl = '/url/to/pic/testPic.jpg';
        picType = 1;
        req = {
            expressRequest: {},
            expressResponse: {},
            accountId: mocker.OperationMocker.getId().toString()
        };
        op = new uploadOp.UploadAccountPictureOperation(req);
        mock = mocker.OperationMocker.mock(op);
        removeFileSpy = spyOn(op, 'executeRemoveFileOperation');
        removeFileSpy.and.callFake(function (path, cb) {
            cb(null);
        });
        uploadSpy = spyOn(op, 'upload');
        uploadSpy.and.callFake(function (fileName, account, next) {
            op['accountPictureType'] = picType;
            next(null, account, fileName);
        });
    });
    it('uploads file to disk', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(uploadSpy.calls.count()).toEqual(1);
            done();
        });
    });
    it('does not call remove operation if account has no picture assigned', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(removeFileSpy.calls.count()).toEqual(0);
            done();
        });
    });
    it('calls remove operation if account has picture assigned', function (done) {
        mock.collectionMock.findOne = function (doc, cb) {
            doc.picture = pictureUrl;
            cb(null, doc);
        };
        mock.collectionMock.save = function (doc, cb) {
            cb(null, pictureUrl, '/pic/to/remove');
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(removeFileSpy.calls.count()).toEqual(1);
            done();
        });
    });
    it('updates account picture in database', function (done) {
        var newPictureUrl;
        mock.collectionMock.save = function (doc, cb) {
            newPictureUrl = doc.picture;
            cb(null);
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(newPictureUrl).not.toEqual(pictureUrl);
            done();
        });
    });
});
//# sourceMappingURL=uploadAccountPicture.spec.js.map