/// <reference path="../../../typings/refs.d.ts" />
var togglePostPaw = require('../../../../../backend/operation/post/togglePostPawOperation');
var post = require('../../../../../backend/entities/postEntity');
var activityEntity = require('../../../../../backend/entities/activityEntity');
var mocker = require('../../../helper/operationMocker');
describe('Toggle post paw', function () {
    var req;
    var op;
    var mock;
    var currentUserId = mocker.OperationMocker.getId();
    beforeEach(function () {
        req = {
            postId: mocker.OperationMocker.getId().toString()
        };
        op = new togglePostPaw.TogglePostPawOperation(req);
        mock = mocker.OperationMocker.mock(op);
        spyOn(op, 'currentUserObjectId').and.callFake(function () { return currentUserId; });
    });
    it('gives paw if not given', function (done) {
        mock.collectionMock.findOne = function (doc, cb) {
            doc.favs = 1;
            doc.ownerId = mocker.OperationMocker.getId();
            cb(null, doc);
        };
        var saveDoc = null;
        mock.collectionMock.save = function (doc, cb) {
            saveDoc = doc;
            cb(null, doc);
        };
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.isPawSet).toBeTruthy();
            expect(saveDoc.paws.length).toEqual(1);
            expect(saveDoc.paws[0].ownerId.toString()).toEqual(currentUserId.toString());
            expect(saveDoc.favs).toEqual(2);
            done();
        });
    });
    it('updates favs for post', function (done) {
        mock.collectionMock.findOne = function (doc, cb) {
            doc.favs = 1;
            cb(null, doc);
        };
        var saveDoc = null;
        mock.collectionMock.save = function (doc, cb) {
            saveDoc = doc;
            cb(null, doc);
        };
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(saveDoc.favs).toEqual(2);
            done();
        });
    });
    it('removes paw if it was given', function (done) {
        mock.collectionMock.findOne = function (doc, cb) {
            doc.paws = [
                { ownerId: currentUserId, createdOn: new Date() },
                { ownerId: currentUserId, createdOn: new Date() }
            ];
            doc.favs = 1;
            cb(null, doc);
        };
        var saveDoc = null;
        mock.collectionMock.save = function (doc, cb) {
            saveDoc = doc;
            cb(null, doc);
        };
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.isPawSet).toBeFalsy();
            expect(saveDoc.paws.length).toEqual(1);
            expect(saveDoc.paws[0].toString()).not.toEqual(currentUserId.toString());
            expect(saveDoc.favs).toEqual(0);
            done();
        });
    });
    it('adds activity if it does not exist for this paw', function (done) {
        mock.collectionMock.findOne = function (doc, cb) {
            if (mock.collectionMock.name === post.CollectionName) {
                doc.paws = [
                    { ownerId: mocker.OperationMocker.getId(), createdOn: new Date() },
                ];
                doc.favs = 1;
                doc.ownerId = mocker.OperationMocker.getId();
            }
            else {
                doc = null;
            }
            cb(null, doc);
        };
        var saveDoc = null;
        mock.collectionMock.save = function (doc, cb) {
            saveDoc = doc;
            cb(null, doc);
        };
        var insertedActivity;
        mock.collectionMock.insert = function (doc, cb) {
            insertedActivity = doc;
            cb(null);
        };
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(insertedActivity.type).toEqual(2);
            done();
        });
    });
    it('removes activity if it exist and paw was removed', function (done) {
        var existingActivity = new activityEntity.ActivityEntity();
        existingActivity._id = mocker.OperationMocker.getId();
        mock.collectionMock.findOne = function (doc, cb) {
            if (mock.collectionMock.name === post.CollectionName) {
                doc.paws = [
                    { ownerId: currentUserId, createdOn: new Date() },
                ];
                doc.favs = 1;
            }
            else {
                doc = existingActivity;
            }
            cb(null, doc);
        };
        var saveDoc = null;
        mock.collectionMock.save = function (doc, cb) {
            saveDoc = doc;
            cb(null, doc);
        };
        var insertedActivity;
        mock.collectionMock.insert = function (doc, cb) {
            insertedActivity = doc;
            cb(null);
        };
        var removedActivity;
        mock.collectionMock.remove = function (doc, cb) {
            removedActivity = doc;
            cb(null);
        };
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(insertedActivity).toBeUndefined();
            expect(removedActivity._id.toString()).toEqual(existingActivity._id.toString());
            done();
        });
    });
});
//# sourceMappingURL=togglePostPaw.spec.js.map