/// <reference path="../../../typings/refs.d.ts" />
import togglePaw = require('../../../../../backend/operation/post/togglePostCommentPawOperation');
import post = require('../../../../../backend/entities/postEntity');
import commentEntity = require('../../../../../backend/entities/commentEntity');
import mocker = require('../../../helper/operationMocker');

describe('Toggle post comment paw',() => {
    var req: ITogglePostCommentPawRequest;
    var op: togglePaw.TogglePostCommentPawOperation;
    var mock: mocker.IMockedOperation;
    var comment: commentEntity.CommentEntity;

    beforeEach(() => {
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

    it('gives paw if not given', (done) => {
        mock.collectionMock.findOne = (doc, cb) => {
            doc.comments = [comment];
            cb(null, doc);
        };

        var saveDoc: post.PostEntity = null;
        mock.collectionMock.save = (doc, cb) => {
            saveDoc = doc;
            cb(null, doc);
        };

        op.execute((response: ITogglePostCommentPawResponse) => {
            expect(response.error).toBeNull();
            expect(response.isPawSet).toBeTruthy();
            expect(saveDoc.comments[0].paws.length).toEqual(1);
            expect(saveDoc.comments[0].paws[0].ownerId.toString()).toEqual(req.accountId);
            done();
        });
    });

    it('removes paw if it was given', (done) => {
        mock.collectionMock.findOne = (doc, cb) => {
            comment.paws = [
                {ownerId: mocker.OperationMocker.getObjectId(req.accountId), createdOn: new Date()}
            ];
            doc.comments = [comment];
            cb(null, doc);
        };

        var saveDoc: post.PostEntity = null;
        mock.collectionMock.save = (doc, cb) => {
            saveDoc = doc;
            cb(null, doc);
        };

        op.execute((response: ITogglePostPawResponse) => {
            expect(response.error).toBeNull();
            expect(response.isPawSet).toBeFalsy();
            expect(saveDoc.comments[0].paws.length).toEqual(0);
            done();
        });
    });

    it('increases post favs by one when adding paw for post comment', (done) => {
        mock.collectionMock.findOne = (doc, cb) => {
            doc.comments = [comment];
            doc.favs = 2;
            cb(null, doc);
        };

        var saveDoc: post.PostEntity = null;
        mock.collectionMock.save = (doc, cb) => {
            saveDoc = doc;
            cb(null, doc);
        };

        op.execute((response: ITogglePostCommentPawResponse) => {
            expect(response.error).toBeNull();
            expect(saveDoc.favs).toEqual(3);
            done();
        });
    });

    it('decreases post favs by one when removing paw from post comment', (done) => {
        mock.collectionMock.findOne = (doc, cb) => {
            comment.paws = [
                {ownerId: mocker.OperationMocker.getObjectId(req.accountId), createdOn: new Date()}
            ];
            doc.comments = [comment];
            doc.favs = 5;
            cb(null, doc);
        };

        var saveDoc: post.PostEntity = null;
        mock.collectionMock.save = (doc, cb) => {
            saveDoc = doc;
            cb(null, doc);
        };

        op.execute((response: ITogglePostPawResponse) => {
            expect(response.error).toBeNull();
            expect(saveDoc.favs).toEqual(4);
            done();
        });
    });
});