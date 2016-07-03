/// <reference path="../../../typings/refs.d.ts" />
var getOp = require('../../../../../backend/operation/login/getAccountByProviderOperation');
var mocker = require('../../../helper/operationMocker');
describe('Get account by provider', function () {
    var req;
    var op;
    var mock;
    beforeEach(function () {
        req = { provider: 1, id: 'someId' };
        op = new getOp.GetAccountByProviderOperation(req);
        mock = mocker.OperationMocker.mock(op);
    });
    it('returns account', function (done) {
        var id = mocker.OperationMocker.getId();
        mock.collectionMock.findOne = function (doc, cb) {
            cb(null, { _id: id, roles: [2] });
        };
        op.execute(function (response) {
            expect(response.account.id).toEqual(id.toString());
            expect(response.exists).toBeTruthy();
            done();
        });
    });
    it('returns not exists if account was not found', function (done) {
        mock.collectionMock.findOne = function (doc, cb) {
            cb(null, null);
        };
        op.execute(function (response) {
            expect(response.exists).toBeFalsy();
            done();
        });
    });
});
//# sourceMappingURL=getAccountByProvider.spec.js.map