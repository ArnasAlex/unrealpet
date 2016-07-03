/// <reference path="../../../typings/refs.d.ts" />
import clearActivities = require('../../../../../backend/operation/activity/clearRecentActivitiesOperation');
import activityEntity = require('../../../../../backend/entities/activityEntity');
import mocker = require('../../../helper/operationMocker');

describe('Clear recent post activities',() => {
    var req: IClearRecentPostActivitiesRequest;
    var op: clearActivities.ClearRecentActivitiesOperation;
    var currentUserId: any;

    beforeEach(() => {
        req = { };
        op = new clearActivities.ClearRecentActivitiesOperation(req);
        setMocks();
    });

    var setMocks = () => {
        currentUserId = mocker.OperationMocker.getId();
        spyOn(op, 'currentUserObjectId').and.callFake(() => {
            return currentUserId;
        });
    };

    it('removes current user activities from database', (done) => {
        var collection, query, update;
        spyOn(op, 'remove').and.callFake((col, q, cb) => {
            collection = col;
            query = q;
            cb(null);
        });

        op.execute((response: IClearRecentPostActivitiesResponse) => {
            expect(response.error).toBeNull();
            expect(collection).toEqual(activityEntity.CollectionName);
            expect(query.accountId.toString()).toEqual(currentUserId.toString());
            done();
        });
    });
});