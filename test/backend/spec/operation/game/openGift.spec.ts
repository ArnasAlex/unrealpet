/// <reference path="../../../typings/refs.d.ts" />
import openGiftOp = require('../../../../../backend/operation/game/openGiftOperation');
import mocker = require('../../../helper/operationMocker');
import playerEntity = require('../../../../../backend/entities/playerEntity');

describe('Open gift',() => {
    var req: IOpenGiftRequest;
    var op: openGiftOp.OpenGiftOperation;
    var mock: mocker.IMockedOperation;
    var player: playerEntity.PlayerEntity;
    var currentUserId = mocker.OperationMocker.getId();
    var savedPlayer: playerEntity.PlayerEntity;
    var giftPoints = 0;

    beforeEach(() => {
        req = {};
        op = new openGiftOp.OpenGiftOperation(req);
        mock = mocker.OperationMocker.mock(op);

        player = new playerEntity.PlayerEntity();

        var hourBefore = new Date();
        hourBefore.setHours(hourBefore.getHours() - 1);
        player.giftArrivesOn = hourBefore;
        player.points = 10;

        mock.collectionMock.findOne = (query, cb) => {
            cb(null, player);
        };

        mock.collectionMock.save = (obj, cb) => {
            savedPlayer = obj;
            cb(null);
        };

        giftPoints = 7;
        spyOn(op, 'getRandomBetween').and.callFake(() => { return giftPoints; });

        spyOn(op, 'currentUserObjectId').and.callFake(() => {return currentUserId});
        savedPlayer = null;
    });

    it('returns gift points', (done) => {
        op.execute((response: IOpenGiftResponse) => {
            expect(response.error).toBeUndefined();
            expect(response.points).toEqual(giftPoints);
            done();
        });
    });

    it('saves gift points and new arrives on date', (done) => {
        op.execute((response: IOpenGiftResponse) => {
            expect(response.error).toBeUndefined();
            expect(savedPlayer.points).toEqual(17);

            var after25Hours = new Date();
            after25Hours.setHours(after25Hours.getHours() + 25);
            expect(savedPlayer.giftArrivesOn.getTime()).toBeLessThan(after25Hours.getTime());

            var after2Hours = new Date();
            after2Hours.setHours(after2Hours.getHours() + 2);
            expect(savedPlayer.giftArrivesOn.getTime()).toBeGreaterThan(after2Hours.getTime());
            done();
        });
    });

    it('returns 0 gift points if there are no gift to open', (done) => {
        var afterHour = new Date();
        afterHour.setHours(afterHour.getHours() + 1);
        player.giftArrivesOn = afterHour;

        op.execute((response: IOpenGiftResponse) => {
            expect(response.error).toBeUndefined();
            expect(response.points).toEqual(0);
            done();
        });
    });

    it('does not update player if there are no gift to open', (done) => {
        var afterHour = new Date();
        afterHour.setHours(afterHour.getHours() + 1);
        player.giftArrivesOn = afterHour;

        op.execute((response: IOpenGiftResponse) => {
            expect(response.error).toBeUndefined();
            expect(savedPlayer).toBeNull();
            done();
        });
    });
});