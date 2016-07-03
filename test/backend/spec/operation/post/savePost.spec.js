/// <reference path="../../../typings/refs.d.ts" />
var savePost = require('../../../../../backend/operation/post/savePostOperation');
var mocker = require('../../../helper/operationMocker');
describe('Save post using url', function () {
    var req;
    var op;
    var mock;
    beforeEach(function () {
        req = {
            id: mocker.OperationMocker.getId().toString(),
            title: 'Test Post',
            contentUrl: '/uploads/url/to/post.jpg',
            contentType: 2
        };
        op = new savePost.SavePostOperation(req);
        mock = mocker.OperationMocker.mock(op);
        mock.collectionMock.setFindOneToNotFound();
    });
    it('creates post record in database', function (done) {
        var saveDoc = null;
        mock.collectionMock.save = function (doc, cb) {
            saveDoc = doc;
            cb(null, doc);
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(saveDoc.title).toEqual(req.title);
            done();
        });
    });
});
describe('Save post with uploaded file', function () {
    var req;
    var op;
    var mock;
    beforeEach(function () {
        req = {
            id: mocker.OperationMocker.getId().toString(),
            title: 'Test Post',
            contentUrl: '/some/url/to/post.jpg',
            contentType: 1
        };
        op = new savePost.SavePostOperation(req);
        mock = mocker.OperationMocker.mock(op);
    });
    it('creates post record in database', function (done) {
        var saveDoc = null;
        mock.collectionMock.save = function (doc, cb) {
            saveDoc = doc;
            cb(null, doc);
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(saveDoc.title).toEqual(req.title);
            expect(saveDoc.favs).toEqual(1);
            done();
        });
    });
});
//# sourceMappingURL=savePost.spec.js.map