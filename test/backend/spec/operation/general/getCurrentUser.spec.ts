/// <reference path="../../../typings/refs.d.ts" />
import getCurrUser = require('../../../../../backend/operation/general/getCurrentUserOperation');
import mocker = require('../../../helper/operationMocker');

describe('Get current user for unauthenticated user',() => {
    var req: getCurrUser.IGetCurrentUserRequest;
    var op: getCurrUser.GetCurrentUserOperation;
    var mock: mocker.IMockedOperation;

    beforeEach(() => {
        req = {accountId: null};
        op = new getCurrUser.GetCurrentUserOperation(req);
        mock = mocker.OperationMocker.mock(op);
    });

    it('returns unauthenticated flag', (done) => {
        op.execute((response: IGetCurrentUserResponse) => {
            expect(response.user.isAuthenticated).toBeFalsy();
            expect(response.user.postCount).toEqual(0);
            done();
        });
    });
});

describe('Get current user for authenticated user',() => {
    var req: getCurrUser.IGetCurrentUserRequest;
    var op: getCurrUser.GetCurrentUserOperation;
    var mock: mocker.IMockedOperation;

    beforeEach(() => {
        req = {accountId: mocker.OperationMocker.getId().toString()};
        op = new getCurrUser.GetCurrentUserOperation(req);
        mock = mocker.OperationMocker.mock(op);
    });

    it('returns user info', (done) => {
        var email = 'abc@abc.com';
        var name = 'Garfield';
        mock.collectionMock.findOne = (doc, cb) => {
            cb(null, {_id: doc._id, email: email, name: name});
        };

        op.execute((response: IGetCurrentUserResponse) => {
            expect(response.user.isAuthenticated).toBeTruthy();
            expect(response.user.email).toEqual(email);
            expect(response.user.name).toEqual(name);
            done();
        });
    });

    it('returns unauthenticated flag if user not found in database', (done) => {
        mock.collectionMock.setFindOneToNotFound();

        var loggedError;
        mock.logError = (err) => { loggedError = err };

        op.execute((response: IGetCurrentUserResponse) => {
            expect(response.user.isAuthenticated).toBeFalsy();
            done();
        });
    });

    it('logs error if user not found by id', (done) => {
        mock.collectionMock.setFindOneToNotFound();

        var loggedError;
        mock.logError = (err) => { loggedError = err };

        op.execute((response: IGetCurrentUserResponse) => {
            expect(loggedError).toContain('not found by id');
            done();
        });
    });

    it('returns post count', (done) => {
        var count = 5;
        var query = null;
        mock.collectionMock.count = (q, cb) => {
            query = q;
            cb(null, count);
        };

        op.execute((response: IGetCurrentUserResponse) => {
            expect(response.user.postCount).toEqual(count);
            expect(query.ownerId.equals(mocker.OperationMocker.getObjectId(req.accountId))).toBeTruthy();
            done();
        });
    });
});
