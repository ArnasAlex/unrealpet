/// <reference path="../../../typings/refs.d.ts" />
var openGiftOp = require('../../../../../backend/operation/game/openGiftOperation');
var mocker = require('../../../helper/operationMocker');
var playerEntity = require('../../../../../backend/entities/playerEntity');
describe('Open gift', function () {
    var req;
    var op;
    var mock;
    var player;
    var currentUserId = mocker.OperationMocker.getId();
    var savedPlayer;
    var giftPoints = 0;
    beforeEach(function () {
        req = {};
        op = new openGiftOp.OpenGiftOperation(req);
        mock = mocker.OperationMocker.mock(op);
        player = new playerEntity.PlayerEntity();
        var hourBefore = new Date();
        hourBefore.setHours(hourBefore.getHours() - 1);
        player.giftArrivesOn = hourBefore;
        player.points = 10;
        mock.collectionMock.findOne = function (query, cb) {
            cb(null, player);
        };
        mock.collectionMock.save = function (obj, cb) {
            savedPlayer = obj;
            cb(null);
        };
        giftPoints = 7;
        spyOn(op, 'getRandomBetween').and.callFake(function () { return giftPoints; });
        spyOn(op, 'currentUserObjectId').and.callFake(function () { return currentUserId; });
        savedPlayer = null;
    });
    it('returns gift points', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.points).toEqual(giftPoints);
            done();
        });
    });
    it('saves gift points and new arrives on date', function (done) {
        op.execute(function (response) {
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
    it('returns 0 gift points if there are no gift to open', function (done) {
        var afterHour = new Date();
        afterHour.setHours(afterHour.getHours() + 1);
        player.giftArrivesOn = afterHour;
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.points).toEqual(0);
            done();
        });
    });
    it('does not update player if there are no gift to open', function (done) {
        var afterHour = new Date();
        afterHour.setHours(afterHour.getHours() + 1);
        player.giftArrivesOn = afterHour;
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(savedPlayer).toBeNull();
            done();
        });
    });
});
//# sourceMappingURL=openGift.spec.js.map