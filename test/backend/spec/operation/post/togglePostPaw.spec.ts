/// <reference path="../../../typings/refs.d.ts" />
import togglePostPaw = require('../../../../../backend/operation/post/togglePostPawOperation');
import post = require('../../../../../backend/entities/postEntity');
import activityEntity = require('../../../../../backend/entities/activityEntity');
import mocker = require('../../../helper/operationMocker');

describe('Toggle post paw',() => {
    var req: ITogglePostPawRequest;
    var op: togglePostPaw.TogglePostPawOperation;
    var mock: mocker.IMockedOperation;
    var currentUserId = mocker.OperationMocker.getId();

    beforeEach(() => {
        req = {
            postId: mocker.OperationMocker.getId().toString()
        };
        op = new togglePostPaw.TogglePostPawOperation(req);
        mock = mocker.OperationMocker.mock(op);
        spyOn(op, 'currentUserObjectId').and.callFake(() => {return currentUserId});
    });

    it('gives paw if not given', (done) => {
        mock.collectionMock.findOne = (doc, cb) => {
            doc.favs = 1;
            doc.ownerId = mocker.OperationMocker.getId();
            cb(null, doc);
        };

        var saveDoc: post.PostEntity = null;
        mock.collectionMock.save = (doc, cb) => {
            saveDoc = doc;
            cb(null, doc);
        };

        op.execute((response: ITogglePostPawResponse) => {
            expect(response.error).toBeUndefined();
            expect(response.isPawSet).toBeTruthy();
            expect(saveDoc.paws.length).toEqual(1);
            expect(saveDoc.paws[0].ownerId.toString()).toEqual(currentUserId.toString());
            expect(saveDoc.favs).toEqual(2);
            done();
        });
    });

    it('updates favs for post', (done) => {
        mock.collectionMock.findOne = (doc, cb) => {
            doc.favs = 1;
            cb(null, doc);
        };

        var saveDoc: post.PostEntity = null;
        mock.collectionMock.save = (doc, cb) => {
            saveDoc = doc;
            cb(null, doc);
        };

        op.execute((response: ITogglePostPawResponse) => {
            expect(response.error).toBeUndefined();
            expect(saveDoc.favs).toEqual(2);
            done();
        });
    });

    it('removes paw if it was given', (done) => {
        mock.collectionMock.findOne = (doc, cb) => {
            doc.paws = [
                {ownerId: currentUserId, createdOn: new Date()},
                {ownerId: currentUserId, createdOn: new Date()}
            ];
            doc.favs = 1;
            cb(null, doc);
        };

        var saveDoc: post.PostEntity = null;
        mock.collectionMock.save = (doc, cb) => {
            saveDoc = doc;
            cb(null, doc);
        };

        op.execute((response: ITogglePostPawResponse) => {
            expect(response.error).toBeUndefined();
            expect(response.isPawSet).toBeFalsy();
            expect(saveDoc.paws.length).toEqual(1);
            expect(saveDoc.paws[0].toString()).not.toEqual(currentUserId.toString());
            expect(saveDoc.favs).toEqual(0);
            done();
        });
    });

    it('adds activity if it does not exist for this paw', (done) => {
        mock.collectionMock.findOne = (doc, cb) => {
            if (mock.collectionMock.name === post.CollectionName){
                doc.paws = [
                    {ownerId: mocker.OperationMocker.getId(), createdOn: new Date()},
                ];
                doc.favs = 1;
                doc.ownerId = mocker.OperationMocker.getId();
            }
            else{
                doc = null;
            }
            cb(null, doc);
        };

        var saveDoc: post.PostEntity = null;
        mock.collectionMock.save = (doc, cb) => {
            saveDoc = doc;
            cb(null, doc);
        };

        var insertedActivity: activityEntity.ActivityEntity;
        mock.collectionMock.insert = (doc, cb) => {
            insertedActivity = doc;
            cb(null);
        };

        op.execute((response: ITogglePostPawResponse) => {
            expect(response.error).toBeUndefined();
            expect(insertedActivity.type).toEqual(ActivityType.MyPostPaw);
            done();
        });
    });

    it('removes activity if it exist and paw was removed', (done) => {
        var existingActivity = new activityEntity.ActivityEntity();
        existingActivity._id = mocker.OperationMocker.getId();

        mock.collectionMock.findOne = (doc, cb) => {
            if (mock.collectionMock.name === post.CollectionName){
                doc.paws = [
                    {ownerId: currentUserId, createdOn: new Date()},
                ];
                doc.favs = 1;
            }
            else{
                doc = existingActivity;
            }
            cb(null, doc);
        };

        var saveDoc: post.PostEntity = null;
        mock.collectionMock.save = (doc, cb) => {
            saveDoc = doc;
            cb(null, doc);
        };

        var insertedActivity: activityEntity.ActivityEntity;
        mock.collectionMock.insert = (doc, cb) => {
            insertedActivity = doc;
            cb(null);
        };

        var removedActivity: activityEntity.ActivityEntity;
        mock.collectionMock.remove = (doc, cb) => {
            removedActivity = doc;
            cb(null);
        };

        op.execute((response: ITogglePostPawResponse) => {
            expect(response.error).toBeUndefined();
            expect(insertedActivity).toBeUndefined();
            expect(removedActivity._id.toString()).toEqual(existingActivity._id.toString());
            done();
        });
    });
});