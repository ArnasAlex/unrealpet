/// <reference path="../../../typings/refs.d.ts" />
import getPetPosts = require('../../../../../backend/operation/post/getPetPostsOperation');
import searchPosts = require('../../../../../backend/operation/post/searchPostsOperation');
import post = require('../../../../../backend/entities/postEntity');
import mocker = require('../../../helper/operationMocker');

describe('Get pet posts',() => {
    var req: IGetPetPostsRequest;
    var op: getPetPosts.GetPetPostsOperation;
    var mock: mocker.IMockedOperation;
    var spySearchExecution: jasmine.Spy;

    beforeEach(() => {
        req = {
            skip: 0,
            take: 20,
            accountId: mocker.OperationMocker.getId().toString()
        };
        op = new getPetPosts.GetPetPostsOperation(req);
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

    it('executes search operation with accountId as query if no id provided', (done) => {
        op.execute((response: IGetPetPostsResponse) => {
            expect(response.error).toBeNull();
            var request = {
                skip: req.skip,
                take: req.take,
                query: {ownerId: mocker.OperationMocker.getObjectId(req.accountId)},
                accountId: req.accountId
            };
            expect(spySearchExecution).toHaveBeenCalledWith(request, jasmine.any(Function));
            done();
        });
    });

    it('executes search operation with defined pet id', (done) => {
        req = {
            skip: 0,
            take: 20,
            accountId: mocker.OperationMocker.getId().toString(),
            id: mocker.OperationMocker.getId().toString()
        };
        op = new getPetPosts.GetPetPostsOperation(req);
        mock = mocker.OperationMocker.mock(op);
        spySearchExecution = spyOn(op, 'executeSearchOperation');
        spySearchExecution.and.callFake((req, next) => {
            var res: searchPosts.ISearchPostsResponse = {
                list: [],
                error: null
            };
            next(null, res);
        });

        op.execute((response: IGetPetPostsResponse) => {
            expect(response.error).toBeNull();
            var request = {
                skip: req.skip,
                take: req.take,
                query: {ownerId: mocker.OperationMocker.getObjectId(req.id)},
                accountId: req.accountId
            };
            expect(spySearchExecution).toHaveBeenCalledWith(request, jasmine.any(Function));
            done();
        });
    });
});