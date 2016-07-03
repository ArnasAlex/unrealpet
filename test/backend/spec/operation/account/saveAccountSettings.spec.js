/// <reference path="../../../typings/refs.d.ts" />
var saveAccSettings = require('../../../../../backend/operation/account/saveAccountSettingsOperation');
var mocker = require('../../../helper/operationMocker');
describe('Save account settings', function () {
    var req;
    var op;
    var mock;
    beforeEach(function () {
        req = {
            accountId: mocker.OperationMocker.getId().toString(),
            language: 2
        };
        op = new saveAccSettings.SaveAccountSettingsOperation(req);
        mock = mocker.OperationMocker.mock(op);
    });
    it('updates account settings', function (done) {
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
            expect(saveDoc.settings.language).toEqual(req.language);
            done();
        });
    });
});
//# sourceMappingURL=saveAccountSettings.spec.js.map