/// <reference path="../../../typings/refs.d.ts" />
var saveAcc = require('../../../../../backend/operation/account/saveAccountOperation');
var mocker = require('../../../helper/operationMocker');
describe('Save user account', function () {
    var req;
    var op;
    var mock;
    beforeEach(function () {
        req = {
            id: mocker.OperationMocker.getId().toString(),
            name: 'Garfield',
            type: 2,
            breed: 'lazy',
            birthday: '2015-05-25',
            about: 'This cat likes lasagna'
        };
        op = new saveAcc.SaveAccountOperation(req);
        mock = mocker.OperationMocker.mock(op);
    });
    it('updates account record in database which was not updated before', function (done) {
        mock.collectionMock.findOne = function (doc, cb) {
            cb(null, { _id: doc._id });
        };
        var saveDoc = null;
        mock.collectionMock.save = function (doc, cb) {
            saveDoc = doc;
            cb(null, doc);
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(saveDoc.name).toEqual(req.name);
            done();
        });
    });
    it('updates existing account record values', function (done) {
        mock.collectionMock.findOne = function (doc, cb) {
            cb(null, { _id: doc._id, name: 'NotGarfield' });
        };
        var saveDoc = null;
        mock.collectionMock.save = function (doc, cb) {
            saveDoc = doc;
            cb(null, doc);
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(saveDoc.name).toEqual(req.name);
            done();
        });
    });
});
//# sourceMappingURL=saveAccount.spec.js.map