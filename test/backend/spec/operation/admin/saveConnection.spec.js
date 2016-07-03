/// <reference path="../../../typings/refs.d.ts" />
var saveConOp = require('../../../../../backend/operation/admin/saveConnectionOperation');
var mocker = require('../../../helper/operationMocker');
describe('Save connection', function () {
    var req;
    var op;
    var mock;
    var connection;
    beforeEach(function () {
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
    it('saves connection for authenticated user', function (done) {
        var saveDoc;
        mock.collectionMock.save = function (doc, cb) {
            saveDoc = doc;
            cb(null, doc);
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(saveDoc.accountId.toString()).toEqual(req.accountId);
            expect(saveDoc.ip).toEqual(req.ip);
            expect(saveDoc.action).toEqual(req.action);
            expect(saveDoc.accountName).toEqual(req.accountName);
            expect(saveDoc.request).toEqual(req.request);
            done();
        });
    });
    it('saves connection for not authenticated user', function (done) {
        req = {
            accountId: null,
            accountName: null,
            ip: '192.168.0.1',
            action: '/Some/Action',
            request: 'somereq.123'
        };
        op = new saveConOp.SaveConnectionOperation(req);
        mock = mocker.OperationMocker.mock(op);
        var saveDoc;
        mock.collectionMock.save = function (doc, cb) {
            saveDoc = doc;
            cb(null, doc);
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(saveDoc.accountId).toEqual(undefined);
            expect(saveDoc.ip).toEqual(req.ip);
            expect(saveDoc.action).toEqual(req.action);
            expect(saveDoc.request).toEqual(req.request);
            done();
        });
    });
});
//# sourceMappingURL=saveConnection.spec.js.map