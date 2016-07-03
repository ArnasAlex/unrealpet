/// <reference path="../../../typings/refs.d.ts" />
var removeAcc = require('../../../../../backend/operation/account/removeAccountPictureOperation');
var mocker = require('../../../helper/operationMocker');
describe('Remove account picture', function () {
    var req;
    var op;
    var mock;
    var removeFileSpy;
    beforeEach(function () {
        req = {
            type: 1,
            accountId: mocker.OperationMocker.getId().toString()
        };
        op = new removeAcc.RemoveAccountPictureOperation(req);
        mock = mocker.OperationMocker.mock(op);
        mock.collectionMock.findOne = function (doc, cb) {
            cb(null, { _id: doc._id, picture: '/some/url/testPic.jpg' });
        };
        removeFileSpy = spyOn(op, 'executeRemoveFileOperation');
        removeFileSpy.and.callFake(function (path, cb) {
            cb(null);
        });
    });
    it('calls remove picture file operation', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(removeFileSpy.calls.count()).toEqual(1);
            done();
        });
    });
    it('removes picture url in database', function (done) {
        var saveDoc;
        mock.collectionMock.save = function (doc, cb) {
            saveDoc = doc;
            cb(null);
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(saveDoc.picture).toBeNull();
            done();
        });
    });
});
//# sourceMappingURL=removeAccountPicture.spec.js.map