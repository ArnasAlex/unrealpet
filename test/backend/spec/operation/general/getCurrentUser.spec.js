/// <reference path="../../../typings/refs.d.ts" />
var getCurrUser = require('../../../../../backend/operation/general/getCurrentUserOperation');
var mocker = require('../../../helper/operationMocker');
describe('Get current user for unauthenticated user', function () {
    var req;
    var op;
    var mock;
    beforeEach(function () {
        req = { accountId: null };
        op = new getCurrUser.GetCurrentUserOperation(req);
        mock = mocker.OperationMocker.mock(op);
    });
    it('returns unauthenticated flag', function (done) {
        op.execute(function (response) {
            expect(response.user.isAuthenticated).toBeFalsy();
            expect(response.user.postCount).toEqual(0);
            done();
        });
    });
});
describe('Get current user for authenticated user', function () {
    var req;
    var op;
    var mock;
    beforeEach(function () {
        req = { accountId: mocker.OperationMocker.getId().toString() };
        op = new getCurrUser.GetCurrentUserOperation(req);
        mock = mocker.OperationMocker.mock(op);
    });
    it('returns user info', function (done) {
        var email = 'abc@abc.com';
        var name = 'Garfield';
        mock.collectionMock.findOne = function (doc, cb) {
            cb(null, { _id: doc._id, email: email, name: name });
        };
        op.execute(function (response) {
            expect(response.user.isAuthenticated).toBeTruthy();
            expect(response.user.email).toEqual(email);
            expect(response.user.name).toEqual(name);
            done();
        });
    });
    it('returns unauthenticated flag if user not found in database', function (done) {
        mock.collectionMock.setFindOneToNotFound();
        var loggedError;
        mock.logError = function (err) { loggedError = err; };
        op.execute(function (response) {
            expect(response.user.isAuthenticated).toBeFalsy();
            done();
        });
    });
    it('logs error if user not found by id', function (done) {
        mock.collectionMock.setFindOneToNotFound();
        var loggedError;
        mock.logError = function (err) { loggedError = err; };
        op.execute(function (response) {
            expect(loggedError).toContain('not found by id');
            done();
        });
    });
    it('returns post count', function (done) {
        var count = 5;
        var query = null;
        mock.collectionMock.count = function (q, cb) {
            query = q;
            cb(null, count);
        };
        op.execute(function (response) {
            expect(response.user.postCount).toEqual(count);
            expect(query.ownerId.equals(mocker.OperationMocker.getObjectId(req.accountId))).toBeTruthy();
            done();
        });
    });
});
//# sourceMappingURL=getCurrentUser.spec.js.map