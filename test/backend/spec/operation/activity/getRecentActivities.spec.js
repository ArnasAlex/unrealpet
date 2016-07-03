/// <reference path="../../../typings/refs.d.ts" />
var getActivities = require('../../../../../backend/operation/activity/getRecentActivitiesOperation');
var activityEntity = require('../../../../../backend/entities/activityEntity');
var mocker = require('../../../helper/operationMocker');
describe('Get recent activities', function () {
    var req;
    var op;
    var mock;
    var activities;
    beforeEach(function () {
        req = {};
        op = new getActivities.GetRecentActivitiesOperation(req);
        setMocks();
        activities = [];
    });
    var setMocks = function () {
        mock = mocker.OperationMocker.mock(op);
        mock.collectionMock.toArray = function (cb) {
            cb(null, activities);
        };
        var currentUserId = mocker.OperationMocker.getId();
        spyOn(op, 'currentUserObjectId').and.callFake(function () {
            return currentUserId;
        });
    };
    it('does not return any activity if there are no activities in db', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.list.length).toEqual(0);
            done();
        });
    });
    it('returns activities if there exist for current user', function (done) {
        var activity = new activityEntity.ActivityEntity();
        activity.title = 'some post title';
        activity.message = 'come comment';
        activity.relatedId = mocker.OperationMocker.getId();
        activity.type = 0;
        activities.push(activity);
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.list.length).toEqual(1);
            expect(response.list[0].title).toEqual(activity.title);
            expect(response.list[0].message).toEqual(activity.message);
            expect(response.list[0].relatedId).toEqual(activity.relatedId.toString());
            expect(response.list[0].type).toEqual(activity.type);
            done();
        });
    });
});
//# sourceMappingURL=getRecentActivities.spec.js.map