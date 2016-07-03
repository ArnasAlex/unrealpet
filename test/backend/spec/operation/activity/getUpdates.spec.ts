/// <reference path="../../../typings/refs.d.ts" />
import getUpdates = require('../../../../../backend/operation/activity/getUpdatesOperation');
import mocker = require('../../../helper/operationMocker');
import envCfg = require('../../../../../backend/config/environmentConfig');

describe('Get updates',() => {
    var req: IGetUpdatesRequest;
    var op: getUpdates.GetUpdatesOperation;
    var mock: mocker.IMockedOperation;
    var activityCount: number;
    var currentUserId: string;

    beforeEach(() => {
        req = { };
        op = new getUpdates.GetUpdatesOperation(req);
        activityCount = 0;
        setMocks();
    });

    var setMocks = () => {
        mock = mocker.OperationMocker.mock(op);
        mock.collectionMock.count = (doc, cb) => {
            cb(null, activityCount);
        };

        currentUserId = mocker.OperationMocker.getId().toString();
        spyOn(op, 'currentUserId').and.callFake(() => {
            return currentUserId;
        })
    };

    it('returns has no activities if there are no activity records', (done) => {
        op.execute((response: IGetUpdatesResponse) => {
            expect(response.error).toBeUndefined();
            expect(response.hasActivities).toBeFalsy();
            done();
        });
    });

    it('returns has activities if user has activities', (done) => {
        activityCount = 5;

        op.execute((response: IGetUpdatesResponse) => {
            expect(response.error).toBeUndefined();
            expect(response.hasActivities).toEqual(true);
            done();
        });
    });

    it('returns application version number for production environment', (done) => {
        spyOn(op, 'getEnvironment').and.callFake(() => {
            return envCfg.Environment.Production;
        });
        op.execute((response: IGetUpdatesResponse) => {
            expect(response.error).toBeUndefined();
            var versionRegex = /(\d*).(\d*).(\d*)/;
            expect(versionRegex.test(response.version)).toEqual(true);
            done();
        });
    });

    it('returns application version "develop" for local environment', (done) => {
        op.execute((response: IGetUpdatesResponse) => {
            expect(response.error).toBeUndefined();
            expect(response.version).toEqual('develop');
            done();
        });
    });
});