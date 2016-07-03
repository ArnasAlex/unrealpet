/// <reference path="../../../typings/refs.d.ts" />
import saveAccSettings = require('../../../../../backend/operation/account/saveAccountSettingsOperation');
import acc = require('../../../../../backend/entities/accountEntity');
import mocker = require('../../../helper/operationMocker');

describe('Save account settings',() => {
    var req: ISaveAccountSettingsRequest;
    var op: saveAccSettings.SaveAccountSettingsOperation;
    var mock: mocker.IMockedOperation;

    beforeEach(() => {
        req = {
            accountId: mocker.OperationMocker.getId().toString(),
            language: Language.Lithuanian
        };
        op = new saveAccSettings.SaveAccountSettingsOperation(req);
        mock = mocker.OperationMocker.mock(op);
    });

    it('updates account settings', (done) => {
        mock.collectionMock.findOne = (doc, cb) => {
            cb(null, {_id: doc._id});
        };

        var saveDoc: acc.AccountEntity = null;
        mock.collectionMock.save = (doc, cb) => {
            saveDoc = doc;
            cb(null, doc);
        };

        op.execute((response: ISaveAccountResponse) => {
            expect(response.error).toBeNull();
            expect(saveDoc.settings.language).toEqual(req.language);
            done();
        });
    });
});