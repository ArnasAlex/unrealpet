/// <reference path="../../../typings/refs.d.ts" />
import saveComment = require('../../../../../backend/operation/post/savePostCommentOperation');
import postEntity = require('../../../../../backend/entities/postEntity');
import commentEntity = require('../../../../../backend/entities/commentEntity');
import activityEntity = require('../../../../../backend/entities/activityEntity');
import account = require('../../../../../backend/entities/accountEntity');
import mocker = require('../../../helper/operationMocker');
import _ = require('lodash');

describe('Save comment',() => {
    var req: ISavePostCommentRequest;
    var op: saveComment.SavePostCommentOperation;
    var mock: mocker.IMockedOperation;
    var saveDoc: postEntity.PostEntity;
    var owner: account.AccountEntity;
    var postOwnerId = mocker.OperationMocker.getId();
    var post: postEntity.PostEntity;

    beforeEach(() => {
        setupOwner();
        setupPost();

        req = {
            postId: mocker.OperationMocker.getId().toString(),
            text: 'some comment text',
            accountId: mocker.OperationMocker.getId().toString()
        };

        initOperation();
    });

    var initOperation = () => {
        op = new saveComment.SavePostCommentOperation(req);
        mock = mocker.OperationMocker.mock(op);

        mock.collectionMock.findOne = (doc, cb) => {
            var result;
            if (mock.collectionMock.name === postEntity.CollectionName) {
                result = post;
            }
            else{
                result = owner;
            }

            cb(null, result);
        };

        mock.collectionMock.save = (doc, cb) => {
            saveDoc = doc;
            cb(null, doc);
        };
    };

    var setupOwner = () => {
        owner = new account.AccountEntity();
        owner._id = mocker.OperationMocker.getId();
        owner.logo = '/some/logo.png';
        owner.name = 'Tom';
    };

    var setupPost = () => {
        post = new postEntity.PostEntity();
        post._id = mocker.OperationMocker.getId();
        post.ownerId = postOwnerId;
        post.favs = 3;
    };

    var addComments = () => {
        post.comments = [];

        var comment = new commentEntity.CommentEntity();
        comment._id = mocker.OperationMocker.getId();
        comment.ownerId = mocker.OperationMocker.getId();
        post.comments.push(comment);

        comment = new commentEntity.CommentEntity();
        comment._id = mocker.OperationMocker.getId();
        comment.ownerId = mocker.OperationMocker.getId();
        post.comments.push(comment);

        comment = new commentEntity.CommentEntity();
        comment._id = mocker.OperationMocker.getId();
        comment.ownerId = post.comments[0].ownerId;
        post.comments.push(comment);
    };

    it('saves comment to post', (done) => {
        op.execute((response: ISavePostCommentResponse) => {
            expect(response.error).toBeNull();
            expect(saveDoc.comments[0].text).toEqual(req.text);
            expect(saveDoc.comments[0].ownerId.toString()).toEqual(req.accountId);
            done();
        });
    });

    it('returns saved comment', (done) => {
        op.execute((response: ISavePostCommentResponse) => {
            expect(response.error).toBeNull();
            expect(response.comment.text).toEqual(req.text);
            expect(response.comment.id.length).toBeGreaterThan(0);
            expect(response.comment.ownerName).toEqual(owner.name);
            expect(response.comment.ownerLogo).toEqual(owner.logo);
            done();
        });
    });

    it('increases favs by one for post', (done) => {
        op.execute((response: ISavePostCommentResponse) => {
            expect(response.error).toBeNull();
            expect(saveDoc.favs).toEqual(4);
            done();
        });
    });

    it('adds owner paw', (done) => {
        op.execute((response: ISavePostCommentResponse) => {
            expect(response.error).toBeNull();
            expect(response.comment.isPawed).toBeTruthy();
            expect(response.comment.paws).toEqual(1);
            expect(saveDoc.comments[0].paws[0].ownerId.toString()).toEqual(req.accountId.toString());
            done();
        });
    });

    it('does not update post ownerViewedOn if not owner is adding comment', (done) => {
        op.execute((response: ISavePostCommentResponse) => {
            expect(response.error).toBeNull();
            expect(saveDoc.ownerViewedOn).toBeUndefined();
            done();
        });
    });

    it('updates post ownerViewedOn if owner is adding comment', (done) => {
        req.accountId = postOwnerId.toString();
        initOperation();

        op.execute((response: ISavePostCommentResponse) => {
            expect(response.error).toBeNull();
            expect(new Date().getTime() - saveDoc.ownerViewedOn.getTime()).toBeLessThan(1000);
            done();
        });
    });

    it('adds activity for post owner', (done) => {
        initOperation();

        var savedActivities: activityEntity.ActivityEntity[];
        mock.collectionMock.insert = (doc, cb) => {
            savedActivities = doc;
        };

        op.execute((response: ISavePostCommentResponse) => {
            expect(response.error).toBeNull();
            expect(savedActivities.length).toEqual(1);
            expect(savedActivities[0].accountId.toString()).toEqual(postOwnerId.toString());
            expect(savedActivities[0].type).toEqual(ActivityType.MyPostComment);
            expect(savedActivities[0].relatedId.toString()).toEqual(post._id.toString());
            expect(savedActivities[0].title).toEqual(post.title);
            expect(savedActivities[0].message).toEqual(req.text);
            done();
        });
    });

    it('adds activity for accounts that commented in post', (done) => {
        initOperation();
        addComments();

        var savedActivities: activityEntity.ActivityEntity[];
        mock.collectionMock.insert = (doc, cb) => {
            savedActivities = doc;
        };

        op.execute((response: ISavePostCommentResponse) => {
            expect(response.error).toBeNull();
            expect(savedActivities.length).toEqual(3);

            var firstCommentSubscriberActivity = _.find(savedActivities,
                    x => x.accountId.toString() === post.comments[0].ownerId.toString());
            expect(firstCommentSubscriberActivity.type).toEqual(ActivityType.OthersPostComment);

            var secondCommentSubscriberActivity = _.find(savedActivities,
                    x => x.accountId.toString() === post.comments[1].ownerId.toString());

            expect(secondCommentSubscriberActivity.type).toEqual(ActivityType.OthersPostComment);
            done();
        });
    });

    it('adds only one activity for post owner if post owner has comments in the post', (done) => {
        initOperation();

        post.comments = [];
        var comment = new commentEntity.CommentEntity();
        comment._id = mocker.OperationMocker.getId();
        comment.ownerId = postOwnerId;
        post.comments.push(comment);

        var savedActivities: activityEntity.ActivityEntity[];
        mock.collectionMock.insert = (doc, cb) => {
            savedActivities = doc;
        };

        op.execute((response: ISavePostCommentResponse) => {
            expect(response.error).toBeNull();
            expect(savedActivities.length).toEqual(1);
            expect(savedActivities[0].accountId.toString()).toEqual(postOwnerId.toString());
            expect(savedActivities[0].type).toEqual(ActivityType.MyPostComment);
            done();
        });
    });
});