/// <reference path="../../../typings/refs.d.ts" />
var getAccSettings = require('../../../../../backend/operation/account/getAccountSettingsOperation');
var mocker = require('../../../helper/operationMocker');
describe('Get account settings', function () {
    var req;
    var op;
    var mock;
    beforeEach(function () {
        req = {
            accountId: mocker.OperationMocker.getId().toString()
        };
        op = new getAccSettings.GetAccountSettingsOperation(req);
        mock = mocker.OperationMocker.mock(op);
    });
    it('returns account settings', function (done) {
        var name = 'Garfield';
        mock.collectionMock.findOne = function (doc, cb) {
            cb(null, { _id: doc._id, name: name, email: 'someemail@gmail.com', settings: { language: 2 } });
        };
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.language).toEqual(2);
            expect(response.email).toEqual('someemail@gmail.com');
            done();
        });
    });
});
//# sourceMappingURL=getAccountSettings.spec.js.map