/// <reference path="../../../typings/refs.d.ts" />
var getAcc = require('../../../../../backend/operation/account/getAccountOperation');
var mocker = require('../../../helper/operationMocker');
describe('Get user account', function () {
    var req;
    var op;
    var mock;
    beforeEach(function () {
        req = {
            id: mocker.OperationMocker.getId().toString()
        };
        op = new getAcc.GetAccountOperation(req);
        mock = mocker.OperationMocker.mock(op);
    });
    it('returns account information', function (done) {
        var name = 'Garfield';
        mock.collectionMock.findOne = function (doc, cb) {
            cb(null, { _id: doc._id, name: name });
        };
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.name).toEqual(name);
            done();
        });
    });
    it('returns generic error if account was not found', function (done) {
        mock.collectionMock.findOne = function (doc, cb) {
            cb(null, null);
        };
        op.execute(function (response) {
            expect(response.error).toContain('error');
            done();
        });
    });
});
//# sourceMappingURL=getAccount.spec.js.map