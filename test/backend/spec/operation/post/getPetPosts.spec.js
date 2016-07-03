/// <reference path="../../../typings/refs.d.ts" />
var getPetPosts = require('../../../../../backend/operation/post/getPetPostsOperation');
var mocker = require('../../../helper/operationMocker');
describe('Get pet posts', function () {
    var req;
    var op;
    var mock;
    var spySearchExecution;
    beforeEach(function () {
        req = {
            skip: 0,
            take: 20,
            accountId: mocker.OperationMocker.getId().toString()
        };
        op = new getPetPosts.GetPetPostsOperation(req);
        mock = mocker.OperationMocker.mock(op);
        spySearchExecution = spyOn(op, 'executeSearchOperation');
        spySearchExecution.and.callFake(function (req, next) {
            var res = {
                list: [],
                error: null
            };
            next(null, res);
        });
    });
    it('executes search operation with accountId as query if no id provided', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            var request = {
                skip: req.skip,
                take: req.take,
                query: { ownerId: mocker.OperationMocker.getObjectId(req.accountId) },
                accountId: req.accountId
            };
            expect(spySearchExecution).toHaveBeenCalledWith(request, jasmine.any(Function));
            done();
        });
    });
    it('executes search operation with defined pet id', function (done) {
        req = {
            skip: 0,
            take: 20,
            accountId: mocker.OperationMocker.getId().toString(),
            id: mocker.OperationMocker.getId().toString()
        };
        op = new getPetPosts.GetPetPostsOperation(req);
        mock = mocker.OperationMocker.mock(op);
        spySearchExecution = spyOn(op, 'executeSearchOperation');
        spySearchExecution.and.callFake(function (req, next) {
            var res = {
                list: [],
                error: null
            };
            next(null, res);
        });
        op.execute(function (response) {
            expect(response.error).toBeNull();
            var request = {
                skip: req.skip,
                take: req.take,
                query: { ownerId: mocker.OperationMocker.getObjectId(req.id) },
                accountId: req.accountId
            };
            expect(spySearchExecution).toHaveBeenCalledWith(request, jasmine.any(Function));
            done();
        });
    });
});
//# sourceMappingURL=getPetPosts.spec.js.map