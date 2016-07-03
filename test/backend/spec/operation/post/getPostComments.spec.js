/// <reference path="../../../typings/refs.d.ts" />
var getComments = require('../../../../../backend/operation/post/getPostCommentsOperation');
var post = require('../../../../../backend/entities/postEntity');
var account = require('../../../../../backend/entities/accountEntity');
var activityEntity = require('../../../../../backend/entities/activityEntity');
var comment = require('../../../../../backend/entities/commentEntity');
var mocker = require('../../../helper/operationMocker');
describe('Get post comments', function () {
    var req;
    var op;
    var mock;
    var postWithComments;
    var owners;
    var spyUpdate;
    var currentUserId;
    beforeEach(function () {
        setupOwners();
        setupPost();
        req = {
            postId: postWithComments._id.toString()
        };
        initOperation();
    });
    var initOperation = function () {
        op = new getComments.GetPostCommentsOperation(req);
        mock = mocker.OperationMocker.mock(op);
        mock.collectionMock.toArray = function (cb) {
            cb(null, owners);
        };
        mock.collectionMock.findOne = function (doc, cb) {
            cb(null, postWithComments);
        };
        spyUpdate = spyOn(mock.collectionMock, 'update');
        spyUpdate.and.callFake(function (query, update, cb) {
            cb(null);
        });
        currentUserId = owners[0]._id;
        spyOn(op, 'currentUserId').and.callFake(function () {
            return currentUserId.toString();
        });
    };
    it('returns list of comments', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.comments.length).toEqual(10);
            done();
        });
    });
    it('returns total comment count which does not include replies', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.totalCount).toEqual(11);
            done();
        });
    });
    it('sorts comments by paw count', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.comments[0].text).toEqual(postWithComments.comments[1].text);
            expect(response.comments[1].text).toEqual(postWithComments.comments[3].text);
            expect(response.comments[2].text).toEqual(postWithComments.comments[4].text);
            done();
        });
    });
    it('sorts comments by creation date if paw count is the same', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.comments[7].text).toEqual(postWithComments.comments[7].text);
            expect(response.comments[8].text).toEqual(postWithComments.comments[8].text);
            expect(response.comments[9].text).toEqual(postWithComments.comments[9].text);
            done();
        });
    });
    it('returns comment info', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.comments[0].text).toEqual(postWithComments.comments[1].text);
            done();
        });
    });
    it('fills owner name', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.comments[0].ownerName).toEqual(owners[1].name);
            expect(response.comments[1].ownerName).toEqual(owners[0].name);
            done();
        });
    });
    it('fills paw count', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.comments[0].paws).toEqual(postWithComments.comments[1].paws.length);
            done();
        });
    });
    it('fills reply count', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.comments[0].replies).toEqual(1);
            expect(response.comments[1].replies).toEqual(0);
            done();
        });
    });
    it('fills is paw set', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.comments[0].isPawed).toBeTruthy();
            expect(response.comments[1].isPawed).toBeFalsy();
            done();
        });
    });
    it('skips comments according to request', function (done) {
        req = {
            postId: mocker.OperationMocker.getId().toString(),
            skip: 7
        };
        initOperation();
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.comments.length).toEqual(4);
            expect(response.totalCount).toEqual(11);
            expect(response.comments[2].text).toEqual(postWithComments.comments[9].text);
            expect(response.comments[3].text).toEqual(postWithComments.comments[10].text);
            done();
        });
    });
    it('does not update ownerViewedOn if not owner is checking post comments', function (done) {
        req = {
            postId: mocker.OperationMocker.getId().toString(),
            skip: 7
        };
        initOperation();
        currentUserId = mocker.OperationMocker.getId();
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(spyUpdate).not.toHaveBeenCalled();
            done();
        });
    });
    it('updates ownerViewedOn if owner is checking post comments', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            var args = spyUpdate.calls.argsFor(0);
            expect(args[0]._id.equals(mocker.OperationMocker.getObjectId(req.postId))).toBeTruthy();
            expect(new Date().getTime() - args[1].$set.ownerViewedOn.getTime()).toBeLessThan(1000);
            done();
        });
    });
    it('clears post recent activities for that post', function (done) {
        var collection, query;
        spyOn(op, 'remove').and.callFake(function (col, q, cb) {
            collection = col;
            query = q;
            cb();
        });
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(collection).toEqual(activityEntity.CollectionName);
            expect(query.accountId.toString()).toEqual(currentUserId.toString());
            expect(query.relatedId.toString()).toEqual(req.postId);
            done();
        });
    });
    var setupOwners = function () {
        owners = [];
        var owner1 = new account.AccountEntity();
        owner1._id = mocker.OperationMocker.getId();
        owner1.name = 'Garfield';
        owners.push(owner1);
        var owner2 = new account.AccountEntity();
        owner2._id = mocker.OperationMocker.getId();
        owner2.name = 'Tom';
        owners.push(owner2);
    };
    var setupPost = function () {
        var post1 = new post.PostEntity();
        post1._id = mocker.OperationMocker.getId();
        post1.pictureUrl = '/some/pic/url2';
        post1.title = 'some title 2';
        post1.ownerId = owners[0]._id;
        post1.paws = [
            { ownerId: mocker.OperationMocker.getId(), createdOn: new Date() },
            { ownerId: mocker.OperationMocker.getId(), createdOn: new Date() }
        ];
        var comment1 = new comment.CommentEntity();
        comment1._id = mocker.OperationMocker.getId();
        comment1.ownerId = owners[0]._id;
        comment1.text = 'Comment with 1 paw';
        comment1.paws = [{ ownerId: mocker.OperationMocker.getId(), createdOn: new Date() }];
        comment1.createdOn = new Date(2010, 1, 20);
        var comment2 = new comment.CommentEntity();
        comment2._id = mocker.OperationMocker.getId();
        comment2.ownerId = owners[1]._id;
        comment2.text = 'Comment with 5 paws';
        comment2.paws = [
            { ownerId: mocker.OperationMocker.getId(), createdOn: new Date() },
            { ownerId: owners[0]._id, createdOn: new Date() },
            { ownerId: mocker.OperationMocker.getId(), createdOn: new Date() },
            { ownerId: mocker.OperationMocker.getId(), createdOn: new Date() },
            { ownerId: mocker.OperationMocker.getId(), createdOn: new Date() }
        ];
        comment2.createdOn = new Date(2010, 1, 21);
        var reply = new comment.CommentEntity();
        reply._id = mocker.OperationMocker.getId();
        reply.ownerId = owners[0]._id;
        reply.text = 'Reply Comment with 1 paw';
        reply.paws = [
            { ownerId: mocker.OperationMocker.getId(), createdOn: new Date() },
            { ownerId: mocker.OperationMocker.getId(), createdOn: new Date() },
            { ownerId: mocker.OperationMocker.getId(), createdOn: new Date() }
        ];
        reply.createdOn = new Date(2010, 1, 20);
        reply.parentCommentId = comment2._id;
        var comment3 = new comment.CommentEntity();
        comment3._id = mocker.OperationMocker.getId();
        comment3.ownerId = owners[1]._id;
        comment3.text = 'Comment without paws';
        comment3.createdOn = new Date(2010, 1, 22);
        var comment4 = new comment.CommentEntity();
        comment4._id = mocker.OperationMocker.getId();
        comment4.ownerId = owners[0]._id;
        comment4.text = 'Comment with 3 paws';
        comment4.paws = [
            { ownerId: mocker.OperationMocker.getId(), createdOn: new Date() },
            { ownerId: mocker.OperationMocker.getId(), createdOn: new Date() },
            { ownerId: mocker.OperationMocker.getId(), createdOn: new Date() }
        ];
        comment4.createdOn = new Date(2010, 1, 23);
        var comment5 = new comment.CommentEntity();
        comment5._id = mocker.OperationMocker.getId();
        comment5.ownerId = owners[1]._id;
        comment5.text = 'Comment with 2 paws other';
        comment5.paws = [
            { ownerId: mocker.OperationMocker.getId(), createdOn: new Date() },
            { ownerId: mocker.OperationMocker.getId(), createdOn: new Date() }
        ];
        comment5.createdOn = new Date(2010, 1, 24);
        var comment6 = new comment.CommentEntity();
        comment6._id = mocker.OperationMocker.getId();
        comment6.ownerId = owners[1]._id;
        comment6.text = 'comment6 without paws other';
        comment6.createdOn = new Date(2010, 1, 25);
        var comment7 = new comment.CommentEntity();
        comment7._id = mocker.OperationMocker.getId();
        comment7.ownerId = owners[1]._id;
        comment7.text = 'comment7 without paws other';
        comment7.createdOn = new Date(2010, 1, 26);
        var comment8 = new comment.CommentEntity();
        comment8._id = mocker.OperationMocker.getId();
        comment8.ownerId = owners[1]._id;
        comment8.text = 'comment8 without paws other';
        comment8.createdOn = new Date(2010, 1, 27);
        var comment9 = new comment.CommentEntity();
        comment9._id = mocker.OperationMocker.getId();
        comment9.ownerId = owners[1]._id;
        comment9.text = 'comment9 without paws other';
        comment9.createdOn = new Date(2010, 1, 28);
        var comment10 = new comment.CommentEntity();
        comment10._id = mocker.OperationMocker.getId();
        comment10.ownerId = owners[1]._id;
        comment10.text = 'comment10 without paws other';
        comment10.createdOn = new Date(2010, 1, 29);
        var comment11 = new comment.CommentEntity();
        comment11._id = mocker.OperationMocker.getId();
        comment11.ownerId = owners[1]._id;
        comment11.text = 'comment11 without paws other';
        comment11.createdOn = new Date(2010, 1, 30);
        post1.comments = [comment1, comment2, comment3, comment4, comment5, comment6,
            comment7, comment8, comment9, comment10, comment11, reply];
        postWithComments = post1;
    };
});
//# sourceMappingURL=getPostComments.spec.js.map