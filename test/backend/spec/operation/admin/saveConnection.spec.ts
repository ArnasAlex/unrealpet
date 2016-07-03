/// <reference path="../../../typings/refs.d.ts" />
import saveConOp = require('../../../../../backend/operation/admin/saveConnectionOperation');
import connection = require('../../../../../backend/entities/connectionEntity');
import mocker = require('../../../helper/operationMocker');

describe('Save connection',() => {
    var req: saveConOp.ISaveConnectionRequest;
    var op: saveConOp.SaveConnectionOperation;
    var mock: mocker.IMockedOperation;
    var connection: connection.ConnectionEntity;

    beforeEach(() => {
        req = {
            ip: '192.168.0.1',
            action: '/Some/Action',
            accountId: mocker.OperationMocker.getId().toString(),
            accountName: 'Acc name',
            request: 'somereq.tt'
        };
        op = new saveConOp.SaveConnectionOperation(req);
        mock = mocker.OperationMocker.mock(op);
    });

    it('saves connection for authenticated user', (done) => {
        var saveDoc: connection.ConnectionEntity;
        mock.collectionMock.save = (doc, cb) => {
            saveDoc = doc;
            cb(null, doc);
        };

        op.execute((response: IGetConnectionsResponse) => {
            expect(response.error).toBeNull();
            expect(saveDoc.accountId.toString()).toEqual(req.accountId);
            expect(saveDoc.ip).toEqual(req.ip);
            expect(saveDoc.action).toEqual(req.action);
            expect(saveDoc.accountName).toEqual(req.accountName);
            expect(saveDoc.request).toEqual(req.request);
            done();
        });
    });

    it('saves connection for not authenticated user', (done) => {
        req = {
            accountId: null,
            accountName: null,
            ip: '192.168.0.1',
            action: '/Some/Action',
            request: 'somereq.123'
        };
        op = new saveConOp.SaveConnectionOperation(req);
        mock = mocker.OperationMocker.mock(op);

        var saveDoc: connection.ConnectionEntity;
        mock.collectionMock.save = (doc, cb) => {
            saveDoc = doc;
            cb(null, doc);
        };

        op.execute((response: IGetConnectionsResponse) => {
            expect(response.error).toBeNull();
            expect(saveDoc.accountId).toEqual(undefined);
            expect(saveDoc.ip).toEqual(req.ip);
            expect(saveDoc.action).toEqual(req.action);
            expect(saveDoc.request).toEqual(req.request);
            done();
        });
    });
});