/// <reference path="../../../typings/refs.d.ts" />
var clearActivities = require('../../../../../backend/operation/activity/clearRecentActivitiesOperation');
var activityEntity = require('../../../../../backend/entities/activityEntity');
var mocker = require('../../../helper/operationMocker');
describe('Clear recent post activities', function () {
    var req;
    var op;
    var currentUserId;
    beforeEach(function () {
        req = {};
        op = new clearActivities.ClearRecentActivitiesOperation(req);
        setMocks();
    });
    var setMocks = function () {
        currentUserId = mocker.OperationMocker.getId();
        spyOn(op, 'currentUserObjectId').and.callFake(function () {
            return currentUserId;
        });
    };
    it('removes current user activities from database', function (done) {
        var collection, query, update;
        spyOn(op, 'remove').and.callFake(function (col, q, cb) {
            collection = col;
            query = q;
            cb(null);
        });
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(collection).toEqual(activityEntity.CollectionName);
            expect(query.accountId.toString()).toEqual(currentUserId.toString());
            done();
        });
    });
});
//# sourceMappingURL=clearRecentActivities.spec.js.map