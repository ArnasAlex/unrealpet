/// <reference path="../../../typings/refs.d.ts" />
import editPost = require('../../../../../backend/operation/post/editPostOperation');
import post = require('../../../../../backend/entities/postEntity');
import mocker = require('../../../helper/operationMocker');

var req: IEditPostRequest;
var op: editPost.EditPostOperation;
var mock: mocker.IMockedOperation;
var currentUserId: string;
var postOwnerId = mocker.OperationMocker.getId();

var initOperation = (req: IEditPostRequest) => {
    op = new editPost.EditPostOperation(req);
    mock = mocker.OperationMocker.mock(op);
    currentUserId = postOwnerId.toString();
    spyOn(op, 'currentUserId').and.callFake(() => { return currentUserId; });
    mock.collectionMock.findOne = (doc, cb) => {
        var res = {
            _id: doc._id,
            ownerId: postOwnerId,
            title: 'old title'
        };
        cb(null, res);
    };
};

describe('Edit post',() => {
    beforeEach(() => {
        req = {
            id: mocker.OperationMocker.getId().toString(),
            title: 'some new title',
            isRemoval: false
        };

        initOperation(req);
    });

    it('returns error if current user is not owner or admin', (done) => {
        currentUserId = mocker.OperationMocker.getId().toString();
        op.execute((response: IEditPostResponse) => {
            expect(response.error).toEqual('server_error_default');
            done();
        });
    });

    it('is available for admin', (done) => {
        currentUserId = mocker.OperationMocker.getId().toString();
        spyOn(op, 'isAdmin').and.callFake(() => {return true;});
        op.execute((response: IEditPostResponse) => {
            expect(response.error).toBeNull();
            done();
        });
    });

    it('is available for post owner', (done) => {
        op.execute((response: IEditPostResponse) => {
            expect(response.error).toBeNull();
            done();
        });
    });

    it('updates post title', (done) => {
        var savedDoc;
        var collection;
        mock.collectionMock.save = (doc, cb) => {
            savedDoc = doc;
            collection = mock.collectionMock.name;
            cb(null);
        };
        op.execute((response: IEditPostResponse) => {
            expect(response.error).toBeNull();
            expect(savedDoc.title).toEqual('some new title');
            expect(collection).toEqual(post.CollectionName);
            done();
        });
    });
});

describe('Edit post when remove flag is set', () => {
    beforeEach(() => {
        req = {
            id: mocker.OperationMocker.getId().toString(),
            isRemoval: true
        };

        initOperation(req);
        currentUserId = postOwnerId.toString();
    });

    it('saves post to deleted collection', (done) => {
        var savedDoc;
        var collection;
        mock.collectionMock.save = (doc, cb) => {
            savedDoc = doc;
            collection = mock.collectionMock.name;
            cb(null);
        };
        op.execute((response: IEditPostResponse) => {
            expect(response.error).toBeNull();
            expect(savedDoc.title).toEqual('old title');
            expect(collection).toEqual(post.DeletedCollectionName);
            done();
        });
    });

    it('deletes post from post collection', (done) => {
        var deletedDoc;
        var collection;
        mock.collectionMock.remove = (doc, cb) => {
            deletedDoc = doc;
            collection = mock.collectionMock.name;
            cb(null);
        };
        op.execute((response: IEditPostResponse) => {
            expect(response.error).toBeNull();
            expect(deletedDoc._id.toString()).toEqual(req.id);
            expect(collection).toEqual(post.CollectionName);
            done();
        });
    });
});


