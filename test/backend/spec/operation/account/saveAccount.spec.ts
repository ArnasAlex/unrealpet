/// <reference path="../../../typings/refs.d.ts" />
import saveAcc = require('../../../../../backend/operation/account/saveAccountOperation');
import acc = require('../../../../../backend/entities/accountEntity');
import mocker = require('../../../helper/operationMocker');

describe('Save user account',() => {
    var req: ISaveAccountRequest;
    var op: saveAcc.SaveAccountOperation;
    var mock: mocker.IMockedOperation;

    beforeEach(() => {
        req = {
            id: mocker.OperationMocker.getId().toString(),
            name: 'Garfield',
            type: PetType.Cat,
            breed: 'lazy',
            birthday: '2015-05-25',
            about: 'This cat likes lasagna'
        };
        op = new saveAcc.SaveAccountOperation(req);
        mock = mocker.OperationMocker.mock(op);
    });

    it('updates account record in database which was not updated before', (done) => {
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
            expect(saveDoc.name).toEqual(req.name);
            done();
        });
    });

    it('updates existing account record values', (done) => {
        mock.collectionMock.findOne = (doc, cb) => {
            cb(null, {_id: doc._id, name: 'NotGarfield'});
        };

        var saveDoc: acc.AccountEntity = null;
        mock.collectionMock.save = (doc, cb) => {
            saveDoc = doc;
            cb(null, doc);
        };

        op.execute((response: ISaveAccountResponse) => {
            expect(response.error).toBeNull();
            expect(saveDoc.name).toEqual(req.name);
            done();
        });
    });
});