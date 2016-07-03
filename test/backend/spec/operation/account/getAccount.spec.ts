/// <reference path="../../../typings/refs.d.ts" />
import getAcc = require('../../../../../backend/operation/account/getAccountOperation');
import acc = require('../../../../../backend/entities/accountEntity');
import mocker = require('../../../helper/operationMocker');

describe('Get user account',() => {
    var req: IGetAccountRequest;
    var op: getAcc.GetAccountOperation;
    var mock: mocker.IMockedOperation;

    beforeEach(() => {
        req = {
            id: mocker.OperationMocker.getId().toString()
        };
        op = new getAcc.GetAccountOperation(req);
        mock = mocker.OperationMocker.mock(op);
    });

    it('returns account information', (done) => {
        var name = 'Garfield';
        mock.collectionMock.findOne = (doc, cb) => {
            cb(null, {_id: doc._id, name: name});
        };

        op.execute((response: IGetAccountResponse) => {
            expect(response.error).toBeUndefined();
            expect(response.name).toEqual(name);
            done();
        });
    });

    it('returns generic error if account was not found', (done) => {
        mock.collectionMock.findOne = (doc, cb) => {
            cb(null, null);
        };

        op.execute((response: IGetAccountResponse) => {
            expect(response.error).toContain('error');
            done();
        });
    });

});