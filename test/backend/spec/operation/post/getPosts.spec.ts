/// <reference path="../../../typings/refs.d.ts" />
import getPosts = require('../../../../../backend/operation/post/getPostsOperation');
import searchPosts = require('../../../../../backend/operation/post/searchPostsOperation');
import post = require('../../../../../backend/entities/postEntity');
import mocker = require('../../../helper/operationMocker');

describe('Get posts',() => {
    var req: IGetPostsRequest;
    var op: getPosts.GetPostsOperation;
    var mock: mocker.IMockedOperation;
    var spySearchExecution: jasmine.Spy;

    beforeEach(() => {
        req = {
            skip: 0,
            take: 20,
            accountId: mocker.OperationMocker.getId().toString()
        };
        op = new getPosts.GetPostsOperation(req);
        mock = mocker.OperationMocker.mock(op);
        spySearchExecution = spyOn(op, 'executeSearchOperation');
        spySearchExecution.and.callFake((req, next) => {
            var res: searchPosts.ISearchPostsResponse = {
                list: [],
                error: null
            };
           next(null, res);
        });
    });

    it('executes search operation with correct params', (done) => {
        op.execute((response: IGetPostsResponse) => {
            expect(response.error).toBeNull();
            var request = {
                skip: req.skip,
                take: req.take,
                query: {},
                accountId: req.accountId
            };
            expect(spySearchExecution).toHaveBeenCalledWith(request, jasmine.any(Function));
            done();
        });
    });
});