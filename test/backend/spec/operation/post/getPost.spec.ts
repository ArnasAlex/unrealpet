/// <reference path="../../../typings/refs.d.ts" />
import getPost = require('../../../../../backend/operation/post/getPostOperation');
import searchPosts = require('../../../../../backend/operation/post/searchPostsOperation');
import post = require('../../../../../backend/entities/postEntity');
import mocker = require('../../../helper/operationMocker');

describe('Get post',() => {
    var req: IGetPostRequest;
    var op: getPost.GetPostOperation;
    var mock: mocker.IMockedOperation;
    var spySearchExecution: jasmine.Spy;
    var currentUserId: string;
    var postOwnerId = mocker.OperationMocker.getId().toString();
    var searchResult: searchPosts.ISearchPostsResponse;

    beforeEach(() => {
        req = {
            id: mocker.OperationMocker.getId().toString(),
            accountId: mocker.OperationMocker.getId().toString()
        };
        op = new getPost.GetPostOperation(req);
        mock = mocker.OperationMocker.mock(op);

        searchResult = {
            list: [<any>{canEdit: false, ownerId: postOwnerId}],
            error: null
        };
        spySearchExecution = spyOn(op, 'executeSearchOperation');
        spySearchExecution.and.callFake((req, next) => {
           next(null, searchResult);
        });

        currentUserId = mocker.OperationMocker.getId().toString();
        spyOn(op, 'currentUserId').and.callFake(() => { return currentUserId; });
    });

    it('executes search operation with correct params', (done) => {
        op.execute((response: IGetPostResponse) => {
            expect(response.error).toBeNull();
            var request = {
                skip: 0,
                take: 1,
                query: {_id: mocker.OperationMocker.getObjectId(req.id)},
                accountId: req.accountId
            };
            expect(spySearchExecution).toHaveBeenCalledWith(request, jasmine.any(Function));
            done();
        });
    });

    it('sets can edit to admin', (done) => {
        spyOn(op, 'isAdmin').and.callFake(() => {return true;});
        op.execute((response: IGetPostResponse) => {
            expect(response.error).toBeNull();
            expect(response.post.canEdit).toBeTruthy();
            done();
        });
    });

    it('sets can edit to post owner', (done) => {
        currentUserId = postOwnerId.toLocaleString();
        op.execute((response: IGetPostResponse) => {
            expect(response.error).toBeNull();
            expect(response.post.canEdit).toBeTruthy();
            done();
        });
    });

    it('sets cannot edit to other user', (done) => {
        op.execute((response: IGetPostResponse) => {
            expect(response.error).toBeNull();
            expect(response.post.canEdit).toBeFalsy();
            done();
        });
    });

    it('returns not found error code if no post was found', (done) => {
        searchResult = {
            list: [],
            error: null
        };
        op.execute((response: IGetPostResponse) => {
            expect(response.error).toEqual(ErrorCodes.NotFound);
            done();
        });
    });
});