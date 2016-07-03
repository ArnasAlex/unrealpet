/// <reference path="../../../typings/refs.d.ts" />
var editPost = require('../../../../../backend/operation/post/editPostOperation');
var post = require('../../../../../backend/entities/postEntity');
var mocker = require('../../../helper/operationMocker');
var req;
var op;
var mock;
var currentUserId;
var postOwnerId = mocker.OperationMocker.getId();
var initOperation = function (req) {
    op = new editPost.EditPostOperation(req);
    mock = mocker.OperationMocker.mock(op);
    currentUserId = postOwnerId.toString();
    spyOn(op, 'currentUserId').and.callFake(function () { return currentUserId; });
    mock.collectionMock.findOne = function (doc, cb) {
        var res = {
            _id: doc._id,
            ownerId: postOwnerId,
            title: 'old title'
        };
        cb(null, res);
    };
};
describe('Edit post', function () {
    beforeEach(function () {
        req = {
            id: mocker.OperationMocker.getId().toString(),
            title: 'some new title',
            isRemoval: false
        };
        initOperation(req);
    });
    it('returns error if current user is not owner or admin', function (done) {
        currentUserId = mocker.OperationMocker.getId().toString();
        op.execute(function (response) {
            expect(response.error).toEqual('server_error_default');
            done();
        });
    });
    it('is available for admin', function (done) {
        currentUserId = mocker.OperationMocker.getId().toString();
        spyOn(op, 'isAdmin').and.callFake(function () { return true; });
        op.execute(function (response) {
            expect(response.error).toBeNull();
            done();
        });
    });
    it('is available for post owner', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            done();
        });
    });
    it('updates post title', function (done) {
        var savedDoc;
        var collection;
        mock.collectionMock.save = function (doc, cb) {
            savedDoc = doc;
            collection = mock.collectionMock.name;
            cb(null);
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(savedDoc.title).toEqual('some new title');
            expect(collection).toEqual(post.CollectionName);
            done();
        });
    });
});
describe('Edit post when remove flag is set', function () {
    beforeEach(function () {
        req = {
            id: mocker.OperationMocker.getId().toString(),
            isRemoval: true
        };
        initOperation(req);
        currentUserId = postOwnerId.toString();
    });
    it('saves post to deleted collection', function (done) {
        var savedDoc;
        var collection;
        mock.collectionMock.save = function (doc, cb) {
            savedDoc = doc;
            collection = mock.collectionMock.name;
            cb(null);
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(savedDoc.title).toEqual('old title');
            expect(collection).toEqual(post.DeletedCollectionName);
            done();
        });
    });
    it('deletes post from post collection', function (done) {
        var deletedDoc;
        var collection;
        mock.collectionMock.remove = function (doc, cb) {
            deletedDoc = doc;
            collection = mock.collectionMock.name;
            cb(null);
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(deletedDoc._id.toString()).toEqual(req.id);
            expect(collection).toEqual(post.CollectionName);
            done();
        });
    });
});
//# sourceMappingURL=editPost.spec.js.map