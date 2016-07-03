/// <reference path="../../../typings/refs.d.ts" />
import getComments = require('../../../../../backend/operation/post/getPostCommentsOperation');
import post = require('../../../../../backend/entities/postEntity');
import account = require('../../../../../backend/entities/accountEntity');
import comment = require('../../../../../backend/entities/commentEntity');
import mocker = require('../../../helper/operationMocker');

describe('Get post comment replies',() => {
    var req: IGetPostCommentsRequest;
    var op: getComments.GetPostCommentsOperation;
    var mock: mocker.IMockedOperation;
    var postWithComments: post.PostEntity;
    var owners: Array<account.AccountEntity>;

    beforeEach(() => {
        setupOwners();
        setupPost();

        req = {
            postId: postWithComments._id.toString(),
            commentId: postWithComments.comments[0]._id.toString()
        };
        op = new getComments.GetPostCommentsOperation(req);
        mock = mocker.OperationMocker.mock(op);

        mock.collectionMock.toArray = (cb) => {
            cb(null, owners);
        };
        mock.collectionMock.findOne = (doc, cb) =>{
            cb(null, postWithComments);
        }
    });

    it('returns list of replies', (done) => {
        op.execute((response: IGetPostCommentsResopnse) => {
            expect(response.error).toBeNull();
            expect(response.comments.length).toEqual(10);
            done();
        });
    });

    it('returns total reply count', (done) => {
        op.execute((response: IGetPostCommentsResopnse) => {
            expect(response.error).toBeNull();
            expect(response.totalCount).toEqual(11);
            done();
        });
    });

    it('sorts replies by paw count', (done) => {
        op.execute((response: IGetPostCommentsResopnse) => {
            expect(response.error).toBeNull();
            expect(response.comments[0].text).toEqual(postWithComments.comments[2].text);
            expect(response.comments[1].text).toEqual(postWithComments.comments[4].text);
            expect(response.comments[2].text).toEqual(postWithComments.comments[1].text);
            done();
        });
    });

    it('sorts replies by creation date if paw count is the same', (done) => {
        op.execute((response: IGetPostCommentsResopnse) => {
            expect(response.error).toBeNull();
            expect(response.comments[7].text).toEqual(postWithComments.comments[8].text);
            expect(response.comments[8].text).toEqual(postWithComments.comments[9].text);
            expect(response.comments[9].text).toEqual(postWithComments.comments[10].text);
            done();
        });
    });

    it('returns reply info', (done) => {
        op.execute((response: IGetPostCommentsResopnse) => {
            expect(response.error).toBeNull();
            expect(response.comments[0].text).toEqual(postWithComments.comments[2].text);
            expect(response.comments[0].parentCommentId).toEqual(postWithComments.comments[0]._id.toString());
            done();
        });
    });

    it('fills owner name', (done) => {
        op.execute((response: IGetPostCommentsResopnse) => {
            expect(response.error).toBeNull();
            expect(response.comments[0].ownerName).toEqual(owners[1].name);
            expect(response.comments[1].ownerName).toEqual(owners[0].name);
            done();
        });
    });

    it('fills paw count', (done) => {
        op.execute((response: IGetPostCommentsResopnse) => {
            expect(response.error).toBeNull();
            expect(response.comments[0].paws).toEqual(postWithComments.comments[2].paws.length);
            done();
        });
    });

    it('skips comments according to request', (done) => {
        setupOwners();
        setupPost();

        req = {
            postId: postWithComments._id.toString(),
            commentId: postWithComments.comments[0]._id.toString(),
            skip: 7
        };
        op = new getComments.GetPostCommentsOperation(req);
        mock = mocker.OperationMocker.mock(op);

        mock.collectionMock.toArray = (cb) => {
            cb(null, owners);
        };
        mock.collectionMock.findOne = (doc, cb) =>{
            cb(null, postWithComments);
        };

        op.execute((response: IGetPostCommentsResopnse) => {
            expect(response.error).toBeNull();
            expect(response.comments.length).toEqual(4);
            expect(response.totalCount).toEqual(11);
            expect(response.comments[2].text).toEqual(postWithComments.comments[10].text);
            expect(response.comments[3].text).toEqual(postWithComments.comments[11].text);
            done();
        });
    });

    var setupOwners = () => {
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

    var setupPost = () => {
        var post1 = new post.PostEntity();
        post1._id = mocker.OperationMocker.getId();
        post1.pictureUrl = '/some/pic/url2';
        post1.title = 'some title 2';
        post1.ownerId = owners[0]._id;
        post1.paws = [
            {ownerId: mocker.OperationMocker.getId(), createdOn: new Date()},
            {ownerId: mocker.OperationMocker.getId(), createdOn: new Date()}
        ];

        var comment1 = new comment.CommentEntity();
        comment1._id = mocker.OperationMocker.getId();
        comment1.ownerId = owners[0]._id;
        comment1.text = 'Comment with 1 paw';
        comment1.paws = [{ownerId: mocker.OperationMocker.getId(), createdOn: new Date()}];
        comment1.createdOn = new Date(2010, 1, 20);

        var reply1 = new comment.CommentEntity();
        reply1._id = mocker.OperationMocker.getId();
        reply1.ownerId = owners[0]._id;
        reply1.text = 'Reply Comment with 2 paws';
        reply1.paws = [
            {ownerId: mocker.OperationMocker.getId(), createdOn: new Date()},
            {ownerId: mocker.OperationMocker.getId(), createdOn: new Date()}
        ];
        reply1.createdOn = new Date(2010, 1, 20);
        reply1.parentCommentId = comment1._id;

        var reply2 = new comment.CommentEntity();
        reply2._id = mocker.OperationMocker.getId();
        reply2.ownerId = owners[1]._id;
        reply2.text = 'reply with 5 paws';
        reply2.paws = [
            {ownerId: mocker.OperationMocker.getId(), createdOn: new Date()},
            {ownerId: mocker.OperationMocker.getId(), createdOn: new Date()},
            {ownerId: mocker.OperationMocker.getId(), createdOn: new Date()},
            {ownerId: mocker.OperationMocker.getId(), createdOn: new Date()},
            {ownerId: mocker.OperationMocker.getId(), createdOn: new Date()}
        ];
        reply2.createdOn = new Date(2010, 1, 21);
        reply2.parentCommentId = comment1._id;

        var reply3 = new comment.CommentEntity();
        reply3._id = mocker.OperationMocker.getId();
        reply3.ownerId = owners[1]._id;
        reply3.text = 'reply without paws';
        reply3.createdOn = new Date(2010, 1, 22);
        reply3.parentCommentId = comment1._id;

        var reply4 = new comment.CommentEntity();
        reply4._id = mocker.OperationMocker.getId();
        reply4.ownerId = owners[0]._id;
        reply4.text = 'reply with 3 paws';
        reply4.paws = [
            {ownerId: mocker.OperationMocker.getId(), createdOn: new Date()},
            {ownerId: mocker.OperationMocker.getId(), createdOn: new Date()},
            {ownerId: mocker.OperationMocker.getId(), createdOn: new Date()}
        ];
        reply4.createdOn = new Date(2010, 1, 23);
        reply4.parentCommentId = comment1._id;

        var reply5 = new comment.CommentEntity();
        reply5._id = mocker.OperationMocker.getId();
        reply5.ownerId = owners[1]._id;
        reply5.text = 'reply with 2 paws other';
        reply5.paws = [
            {ownerId: mocker.OperationMocker.getId(), createdOn: new Date()},
            {ownerId: mocker.OperationMocker.getId(), createdOn: new Date()}
        ];
        reply5.createdOn = new Date(2010, 1, 24);
        reply5.parentCommentId = comment1._id;

        var reply6 = new comment.CommentEntity();
        reply6._id = mocker.OperationMocker.getId();
        reply6.ownerId = owners[1]._id;
        reply6.text = 'reply6 without paws other';
        reply6.createdOn = new Date(2010, 1, 25);
        reply6.parentCommentId = comment1._id;

        var reply7 = new comment.CommentEntity();
        reply7._id = mocker.OperationMocker.getId();
        reply7.ownerId = owners[1]._id;
        reply7.text = 'reply7 without paws other';
        reply7.createdOn = new Date(2010, 1, 26);
        reply7.parentCommentId = comment1._id;

        var reply8 = new comment.CommentEntity();
        reply8._id = mocker.OperationMocker.getId();
        reply8.ownerId = owners[1]._id;
        reply8.text = 'reply8 without paws other';
        reply8.createdOn = new Date(2010, 1, 27);
        reply8.parentCommentId = comment1._id;

        var reply9 = new comment.CommentEntity();
        reply9._id = mocker.OperationMocker.getId();
        reply9.ownerId = owners[1]._id;
        reply9.text = 'reply9 without paws other';
        reply9.createdOn = new Date(2010, 1, 28);
        reply9.parentCommentId = comment1._id;

        var reply10 = new comment.CommentEntity();
        reply10._id = mocker.OperationMocker.getId();
        reply10.ownerId = owners[1]._id;
        reply10.text = 'reply10 without paws other';
        reply10.createdOn = new Date(2010, 1, 29);
        reply10.parentCommentId = comment1._id;

        var reply11 = new comment.CommentEntity();
        reply11._id = mocker.OperationMocker.getId();
        reply11.ownerId = owners[1]._id;
        reply11.text = 'reply11 without paws other';
        reply11.createdOn = new Date(2010, 1, 30);
        reply11.parentCommentId = comment1._id;

        post1.comments = [comment1, reply1, reply2, reply3, reply4, reply5, reply6,
            reply7, reply8, reply9, reply10, reply11];
        postWithComments = post1;
    };
});