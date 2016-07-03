/// <reference path="../../../typings/refs.d.ts" />
var getPosts = require('../../../../../backend/operation/post/getPostsOperation');
var mocker = require('../../../helper/operationMocker');
describe('Get posts', function () {
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
        op = new getPosts.GetPostsOperation(req);
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
    it('executes search operation with correct params', function (done) {
        op.execute(function (response) {
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
//# sourceMappingURL=getPosts.spec.js.map