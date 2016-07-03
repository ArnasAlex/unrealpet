/// <reference path="../../../typings/refs.d.ts" />
var getPost = require('../../../../../backend/operation/post/getPostOperation');
var mocker = require('../../../helper/operationMocker');
describe('Get post', function () {
    var req;
    var op;
    var mock;
    var spySearchExecution;
    var currentUserId;
    var postOwnerId = mocker.OperationMocker.getId().toString();
    var searchResult;
    beforeEach(function () {
        req = {
            id: mocker.OperationMocker.getId().toString(),
            accountId: mocker.OperationMocker.getId().toString()
        };
        op = new getPost.GetPostOperation(req);
        mock = mocker.OperationMocker.mock(op);
        searchResult = {
            list: [{ canEdit: false, ownerId: postOwnerId }],
            error: null
        };
        spySearchExecution = spyOn(op, 'executeSearchOperation');
        spySearchExecution.and.callFake(function (req, next) {
            next(null, searchResult);
        });
        currentUserId = mocker.OperationMocker.getId().toString();
        spyOn(op, 'currentUserId').and.callFake(function () { return currentUserId; });
    });
    it('executes search operation with correct params', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            var request = {
                skip: 0,
                take: 1,
                query: { _id: mocker.OperationMocker.getObjectId(req.id) },
                accountId: req.accountId
            };
            expect(spySearchExecution).toHaveBeenCalledWith(request, jasmine.any(Function));
            done();
        });
    });
    it('sets can edit to admin', function (done) {
        spyOn(op, 'isAdmin').and.callFake(function () { return true; });
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.post.canEdit).toBeTruthy();
            done();
        });
    });
    it('sets can edit to post owner', function (done) {
        currentUserId = postOwnerId.toLocaleString();
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.post.canEdit).toBeTruthy();
            done();
        });
    });
    it('sets cannot edit to other user', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.post.canEdit).toBeFalsy();
            done();
        });
    });
    it('returns not found error code if no post was found', function (done) {
        searchResult = {
            list: [],
            error: null
        };
        op.execute(function (response) {
            expect(response.error).toEqual(2);
            done();
        });
    });
});
//# sourceMappingURL=getPost.spec.js.map