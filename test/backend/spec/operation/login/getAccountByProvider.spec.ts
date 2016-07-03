/// <reference path="../../../typings/refs.d.ts" />
import getOp = require('../../../../../backend/operation/login/getAccountByProviderOperation');
import mocker = require('../../../helper/operationMocker');

describe('Get account by provider',() => {
    var req: getOp.IGetAccountByProviderRequest;
    var op: getOp.GetAccountByProviderOperation;
    var mock: mocker.IMockedOperation;

    beforeEach(() => {
        req = {provider: LoginProvider.Google, id: 'someId'};
        op = new getOp.GetAccountByProviderOperation(req);
        mock = mocker.OperationMocker.mock(op);
    });

    it('returns account', (done) => {
        var id = mocker.OperationMocker.getId();
        mock.collectionMock.findOne = (doc, cb) => {
            cb(null, {_id: id, roles: [Role.Admin]});
        };

        op.execute((response: getOp.IGetAccountByProviderResponse) => {
            expect(response.account.id).toEqual(id.toString());
            expect(response.exists).toBeTruthy();
            done();
        });
    });

    it('returns not exists if account was not found', (done) => {
        mock.collectionMock.findOne = (doc, cb) => {
            cb(null, null);
        };

        op.execute((response: getOp.IGetAccountByProviderResponse) => {
            expect(response.exists).toBeFalsy();
            done();
        });
    });
});