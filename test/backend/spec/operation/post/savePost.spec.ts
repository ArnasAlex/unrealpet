/// <reference path="../../../typings/refs.d.ts" />
import savePost = require('../../../../../backend/operation/post/savePostOperation');
import post = require('../../../../../backend/entities/postEntity');
import mocker = require('../../../helper/operationMocker');

describe('Save post using url',() => {
    var req: ISavePostRequest;
    var op: savePost.SavePostOperation;
    var mock: mocker.IMockedOperation;

    beforeEach(() => {
        req = {
            id: mocker.OperationMocker.getId().toString(),
            title: 'Test Post',
            contentUrl: '/uploads/url/to/post.jpg',
            contentType: PostContentType.UrlPicture
        };
        op = new savePost.SavePostOperation(req);
        mock = mocker.OperationMocker.mock(op);

        mock.collectionMock.setFindOneToNotFound();
    });

    it('creates post record in database', (done) => {
        var saveDoc: post.PostEntity = null;
        mock.collectionMock.save = (doc, cb) => {
            saveDoc = doc;
            cb(null, doc);
        };

        op.execute((response: ISavePostResponse) => {
            expect(response.error).toBeNull();
            expect(saveDoc.title).toEqual(req.title);
            done();
        });
    });
});

describe('Save post with uploaded file',() => {
    var req: ISavePostRequest;
    var op: savePost.SavePostOperation;
    var mock: mocker.IMockedOperation;

    beforeEach(() => {
        req = {
            id: mocker.OperationMocker.getId().toString(),
            title: 'Test Post',
            contentUrl: '/some/url/to/post.jpg',
            contentType: PostContentType.UploadedPicture
        };
        op = new savePost.SavePostOperation(req);
        mock = mocker.OperationMocker.mock(op);
    });

    it('creates post record in database', (done) => {
        var saveDoc: post.PostEntity = null;
        mock.collectionMock.save = (doc, cb) => {
            saveDoc = doc;
            cb(null, doc);
        };

        op.execute((response: ISavePostResponse) => {
            expect(response.error).toBeNull();
            expect(saveDoc.title).toEqual(req.title);
            expect(saveDoc.favs).toEqual(1);
            done();
        });
    });
});