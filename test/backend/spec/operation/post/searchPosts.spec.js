/// <reference path="../../../typings/refs.d.ts" />
var searchPosts = require('../../../../../backend/operation/post/searchPostsOperation');
var post = require('../../../../../backend/entities/postEntity');
var account = require('../../../../../backend/entities/accountEntity');
var comment = require('../../../../../backend/entities/commentEntity');
var mocker = require('../../../helper/operationMocker');
var _ = require('lodash');
describe('Search posts', function () {
    var req;
    var op;
    var mock;
    var posts;
    var owners;
    beforeEach(function () {
        setupOwners();
        setupPosts();
        req = {
            skip: 0,
            take: 20
        };
        req.accountId = owners[0]._id.toString();
        initOperation();
    });
    var initOperation = function () {
        op = new searchPosts.SearchPostsOperation(req);
        mock = mocker.OperationMocker.mock(op);
        mock.collectionMock.toArray = function (cb) {
            var result;
            if (mock.collectionMock.name === post.CollectionName) {
                result = posts;
            }
            else {
                result = owners;
            }
            cb(null, result);
        };
    };
    it('returns list of posts', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.list.length).toEqual(2);
            done();
        });
    });
    it('returns post info', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.list[0].contentUrl).toEqual(posts[0].pictureUrl);
            expect(response.list[1].title).toEqual(posts[1].title);
            done();
        });
    });
    it('sorts by creation date', function (done) {
        var sort;
        mock.collectionMock.sort = function (doc) {
            sort = doc;
            return mock.collectionMock;
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(sort.createdOn).toEqual(-1);
            done();
        });
    });
    it('returns not more than 20 posts', function (done) {
        var countPassed = 0;
        mock.collectionMock.limit = function (count) {
            countPassed = count;
            return mock.collectionMock;
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(countPassed).toEqual(20);
            done();
        });
    });
    it('fills owner name', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.list[0].ownerName).toEqual(owners[0].name);
            expect(response.list[1].ownerName).toEqual(owners[1].name);
            done();
        });
    });
    it('fills top comment and top comment owner name', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.list[1].topComment).toEqual(posts[1].comments[1].text);
            expect(response.list[1].topCommentOwnerName).toEqual(owners[2].name);
            done();
        });
    });
    it('fills comment count', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.list[1].comments).toEqual(posts[1].comments.length);
            done();
        });
    });
    it('fills paw count', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.list[1].paws).toEqual(posts[1].paws.length);
            done();
        });
    });
    it('sets is pawed for post', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.list[0].isPawed).toBeFalsy();
            expect(response.list[1].isPawed).toBeTruthy();
            done();
        });
    });
    it('sets is pawed for post', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.list[0].isPawed).toBeFalsy();
            expect(response.list[1].isPawed).toBeTruthy();
            done();
        });
    });
    it('sets unread comment count 0 and unviewed paws 0 to non owner', function (done) {
        req.accountId = null;
        initOperation();
        op.execute(function (response) {
            expect(response.error).toBeNull();
            var allPostsWith0UnreadComments = _.all(response.list, function (post) { return post.unreadComments === 0; });
            var allPostsWith0UnviewedPaws = _.all(response.list, function (post) { return post.unviewedPaws === 0; });
            expect(allPostsWith0UnreadComments).toBeTruthy();
            expect(allPostsWith0UnviewedPaws).toBeTruthy();
            done();
        });
    });
    it('sets unread comment count to post owner', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.list[0].unreadComments).toEqual(1);
            expect(response.list[1].unreadComments).toEqual(0);
            done();
        });
    });
    it('sets unviewed paw count to post owner', function (done) {
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        posts[1].ownerViewedOn = yesterday;
        req.accountId = posts[1].ownerId.toString();
        initOperation();
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.list[0].unviewedPaws).toEqual(0);
            expect(response.list[1].unviewedPaws).toEqual(2);
            done();
        });
    });
    it('sets unread count to 0 if post is older than 30 days', function (done) {
        var minus31Days = new Date();
        minus31Days.setDate(minus31Days.getDate() - 31);
        posts[0].updatedOn = minus31Days;
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.list[0].unreadComments).toEqual(0);
            done();
        });
    });
    it('sets unread count to 0 if post is younger than 30 days', function (done) {
        var minus29Days = new Date();
        minus29Days.setDate(minus29Days.getDate() - 29);
        posts[0].updatedOn = minus29Days;
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.list[0].unreadComments).toEqual(1);
            done();
        });
    });
    it('sets unread comments which are created after user viewed post comments', function (done) {
        req.accountId = owners[1]._id.toString();
        initOperation();
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        posts[1].ownerViewedOn = yesterday;
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.list[0].unreadComments).toEqual(0);
            expect(response.list[1].unreadComments).toEqual(1);
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
        var owner3 = new account.AccountEntity();
        owner3._id = mocker.OperationMocker.getId();
        owner3.name = 'TopCommenter';
        owners.push(owner3);
        var owner4 = new account.AccountEntity();
        owner4._id = mocker.OperationMocker.getId();
        owner4.name = 'NotTopCommenter';
        owners.push(owner4);
    };
    var setupPosts = function () {
        posts = [];
        var commentFirstPost = new comment.CommentEntity();
        commentFirstPost.ownerId = owners[3]._id;
        commentFirstPost.createdOn = new Date();
        commentFirstPost.text = 'Some comment in first post';
        commentFirstPost.paws = [{ ownerId: owners[0]._id, createdOn: new Date() }];
        var post1 = new post.PostEntity();
        post1._id = mocker.OperationMocker.getId();
        post1.pictureUrl = '/some/pic/url1';
        post1.title = 'some title 1';
        post1.ownerId = owners[0]._id;
        post1.updatedOn = new Date();
        post1.comments = [commentFirstPost];
        posts.push(post1);
        var post2 = new post.PostEntity();
        post2._id = mocker.OperationMocker.getId();
        post2.pictureUrl = '/some/pic/url2';
        post2.title = 'some title 2';
        post2.ownerId = owners[1]._id;
        post2.updatedOn = new Date();
        post2.paws = [
            { ownerId: owners[0]._id, createdOn: new Date() },
            { ownerId: mocker.OperationMocker.getId(), createdOn: new Date() },
            { ownerId: post2.ownerId, createdOn: new Date() },
        ];
        var comment1 = new comment.CommentEntity();
        comment1.ownerId = owners[3]._id;
        comment1.createdOn = new Date();
        comment1.text = 'Some comment in post';
        comment1.paws = [{ ownerId: owners[0]._id, createdOn: new Date() }];
        var comment2 = new comment.CommentEntity();
        comment2.ownerId = owners[2]._id;
        comment2.createdOn = new Date();
        comment2.createdOn.setDate(new Date().getDate() - 2);
        comment2.text = 'Some comment in post with top comment';
        comment2.paws = [
            { ownerId: mocker.OperationMocker.getId(), createdOn: new Date() },
            { ownerId: mocker.OperationMocker.getId(), createdOn: new Date() }
        ];
        var comment3 = new comment.CommentEntity();
        comment3.createdOn = new Date();
        comment3.createdOn.setDate(new Date().getDate() - 4);
        comment3.ownerId = owners[1]._id;
        comment3.text = 'Comment without paws';
        comment3.paws;
        post2.comments = [comment1, comment2, comment3];
        posts.push(post2);
    };
});
//# sourceMappingURL=searchPosts.spec.js.map