/// <reference path="../../../typings/refs.d.ts" />
import getAccSettings = require('../../../../../backend/operation/account/getAccountSettingsOperation');
import acc = require('../../../../../backend/entities/accountEntity');
import mocker = require('../../../helper/operationMocker');

describe('Get account settings',() => {
    var req: IGetAccountSettingsRequest;
    var op: getAccSettings.GetAccountSettingsOperation;
    var mock: mocker.IMockedOperation;

    beforeEach(() => {
        req = {
            accountId: mocker.OperationMocker.getId().toString()
        };
        op = new getAccSettings.GetAccountSettingsOperation(req);
        mock = mocker.OperationMocker.mock(op);
    });

    it('returns account settings', (done) => {
        var name = 'Garfield';
        mock.collectionMock.findOne = (doc, cb) => {
            cb(null, {_id: doc._id, name: name, email: 'someemail@gmail.com', settings: {language: Language.Lithuanian}});
        };

        op.execute((response: IGetAccountSettingsResponse) => {
            expect(response.error).toBeUndefined();
            expect(response.language).toEqual(Language.Lithuanian);
            expect(response.email).toEqual('someemail@gmail.com');
            done();
        });
    });
});