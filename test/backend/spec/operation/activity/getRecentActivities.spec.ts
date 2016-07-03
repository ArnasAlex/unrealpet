/// <reference path="../../../typings/refs.d.ts" />
import getActivities = require('../../../../../backend/operation/activity/getRecentActivitiesOperation');
import activityEntity = require('../../../../../backend/entities/activityEntity');
import mocker = require('../../../helper/operationMocker');

describe('Get recent activities',() => {
    var req: IGetRecentPostActivitiesRequest;
    var op: getActivities.GetRecentActivitiesOperation;
    var mock: mocker.IMockedOperation;
    var activities: activityEntity.ActivityEntity[];

    beforeEach(() => {
        req = { };
        op = new getActivities.GetRecentActivitiesOperation(req);
        setMocks();
        activities = [];
    });

    var setMocks = () => {
        mock = mocker.OperationMocker.mock(op);
        mock.collectionMock.toArray = (cb) => {
            cb(null, activities);
        };

        var currentUserId = mocker.OperationMocker.getId();
        spyOn(op, 'currentUserObjectId').and.callFake(() => {
            return currentUserId;
        })
    };

    it('does not return any activity if there are no activities in db', (done) => {
        op.execute((response: IGetRecentPostActivitiesResponse) => {
            expect(response.error).toBeNull();
            expect(response.list.length).toEqual(0);
            done();
        });
    });

    it('returns activities if there exist for current user', (done) => {
        var activity = new activityEntity.ActivityEntity();
        activity.title = 'some post title';
        activity.message = 'come comment';
        activity.relatedId = mocker.OperationMocker.getId();
        activity.type = ActivityType.MyPostComment;
        activities.push(activity);

        op.execute((response: IGetRecentPostActivitiesResponse) => {
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