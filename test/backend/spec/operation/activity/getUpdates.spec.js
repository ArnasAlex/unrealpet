/// <reference path="../../../typings/refs.d.ts" />
var getUpdates = require('../../../../../backend/operation/activity/getUpdatesOperation');
var mocker = require('../../../helper/operationMocker');
var envCfg = require('../../../../../backend/config/environmentConfig');
describe('Get updates', function () {
    var req;
    var op;
    var mock;
    var activityCount;
    var currentUserId;
    beforeEach(function () {
        req = {};
        op = new getUpdates.GetUpdatesOperation(req);
        activityCount = 0;
        setMocks();
    });
    var setMocks = function () {
        mock = mocker.OperationMocker.mock(op);
        mock.collectionMock.count = function (doc, cb) {
            cb(null, activityCount);
        };
        currentUserId = mocker.OperationMocker.getId().toString();
        spyOn(op, 'currentUserId').and.callFake(function () {
            return currentUserId;
        });
    };
    it('returns has no activities if there are no activity records', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.hasActivities).toBeFalsy();
            done();
        });
    });
    it('returns has activities if user has activities', function (done) {
        activityCount = 5;
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.hasActivities).toEqual(true);
            done();
        });
    });
    it('returns application version number for production environment', function (done) {
        spyOn(op, 'getEnvironment').and.callFake(function () {
            return envCfg.Environment.Production;
        });
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            var versionRegex = /(\d*).(\d*).(\d*)/;
            expect(versionRegex.test(response.version)).toEqual(true);
            done();
        });
    });
    it('returns application version "develop" for local environment', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.version).toEqual('develop');
            done();
        });
    });
});
//# sourceMappingURL=getUpdates.spec.js.map