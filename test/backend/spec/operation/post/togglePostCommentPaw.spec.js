/// <reference path="../../../typings/refs.d.ts" />
var togglePaw = require('../../../../../backend/operation/post/togglePostCommentPawOperation');
var commentEntity = require('../../../../../backend/entities/commentEntity');
var mocker = require('../../../helper/operationMocker');
describe('Toggle post comment paw', function () {
    var req;
    var op;
    var mock;
    var comment;
    beforeEach(function () {
        comment = new commentEntity.CommentEntity();
        comment._id = mocker.OperationMocker.getId();
        comment.paws = [];
        req = {
            postId: mocker.OperationMocker.getId().toString(),
            commentId: comment._id.toString(),
            accountId: mocker.OperationMocker.getId().toString()
        };
        op = new togglePaw.TogglePostCommentPawOperation(req);
        mock = mocker.OperationMocker.mock(op);
    });
    it('gives paw if not given', function (done) {
        mock.collectionMock.findOne = function (doc, cb) {
            doc.comments = [comment];
            cb(null, doc);
        };
        var saveDoc = null;
        mock.collectionMock.save = function (doc, cb) {
            saveDoc = doc;
            cb(null, doc);
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.isPawSet).toBeTruthy();
            expect(saveDoc.comments[0].paws.length).toEqual(1);
            expect(saveDoc.comments[0].paws[0].ownerId.toString()).toEqual(req.accountId);
            done();
        });
    });
    it('removes paw if it was given', function (done) {
        mock.collectionMock.findOne = function (doc, cb) {
            comment.paws = [
                { ownerId: mocker.OperationMocker.getObjectId(req.accountId), createdOn: new Date() }
            ];
            doc.comments = [comment];
            cb(null, doc);
        };
        var saveDoc = null;
        mock.collectionMock.save = function (doc, cb) {
            saveDoc = doc;
            cb(null, doc);
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.isPawSet).toBeFalsy();
            expect(saveDoc.comments[0].paws.length).toEqual(0);
            done();
        });
    });
    it('increases post favs by one when adding paw for post comment', function (done) {
        mock.collectionMock.findOne = function (doc, cb) {
            doc.comments = [comment];
            doc.favs = 2;
            cb(null, doc);
        };
        var saveDoc = null;
        mock.collectionMock.save = function (doc, cb) {
            saveDoc = doc;
            cb(null, doc);
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(saveDoc.favs).toEqual(3);
            done();
        });
    });
    it('decreases post favs by one when removing paw from post comment', function (done) {
        mock.collectionMock.findOne = function (doc, cb) {
            comment.paws = [
                { ownerId: mocker.OperationMocker.getObjectId(req.accountId), createdOn: new Date() }
            ];
            doc.comments = [comment];
            doc.favs = 5;
            cb(null, doc);
        };
        var saveDoc = null;
        mock.collectionMock.save = function (doc, cb) {
            saveDoc = doc;
            cb(null, doc);
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(saveDoc.favs).toEqual(4);
            done();
        });
    });
});
//# sourceMappingURL=togglePostCommentPaw.spec.js.map