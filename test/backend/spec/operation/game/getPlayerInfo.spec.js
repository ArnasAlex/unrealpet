/// <reference path="../../../typings/refs.d.ts" />
var getPlayerInfoOp = require('../../../../../backend/operation/game/getPlayerInfoOperation');
var mocker = require('../../../helper/operationMocker');
var playerEntity = require('../../../../../backend/entities/playerEntity');
describe('Get player info', function () {
    var req;
    var op;
    var mock;
    var player;
    var currentUserId = mocker.OperationMocker.getId();
    beforeEach(function () {
        req = {};
        op = new getPlayerInfoOp.GetPlayerInfoOperation(req);
        mock = mocker.OperationMocker.mock(op);
        player = new playerEntity.PlayerEntity();
        player.pictureUrl = '/uploads/g/picture.jpeg';
        player.points = 99;
        player.fights = 100;
        player.win = 80;
        player.defeat = 20;
        player.status = 1;
        var playerCount = 1000;
        var playersWithMorePoints = 33;
        mock.collectionMock.count = function (query, cb) {
            var result = playerCount;
            if (query.points) {
                result = playersWithMorePoints;
            }
            cb(null, result);
        };
        mock.collectionMock.findOne = function (query, cb) {
            cb(null, player);
        };
        spyOn(op, 'currentUserObjectId').and.callFake(function () { return currentUserId; });
    });
    it('returns player information', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.pictureUrl).toEqual('/uploads/g/picture.jpeg');
            expect(response.points).toEqual(99);
            expect(response.fights).toEqual(100);
            expect(response.defeats).toEqual(20);
            expect(response.wins).toEqual(80);
            expect(response.isRegistered).toBeTruthy();
            done();
        });
    });
    it('returns total player count', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.totalPlayers).toEqual(1000);
            done();
        });
    });
    it('returns player place', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.place).toEqual(34);
            done();
        });
    });
    it('returns not registered if no player is found', function (done) {
        player = null;
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.isRegistered).toBeFalsy();
            done();
        });
    });
    it('returns gift if never recieved one', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.hasGift).toBeTruthy();
            done();
        });
    });
    it('returns gift if it arrived hour before', function (done) {
        var hourBefore = new Date();
        hourBefore.setHours(hourBefore.getHours() - 1);
        player.giftArrivesOn = hourBefore;
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.hasGift).toBeTruthy();
            done();
        });
    });
    it('returns no gift if it arrives after hour', function (done) {
        var hourBefore = new Date();
        hourBefore.setHours(hourBefore.getHours() + 1);
        player.giftArrivesOn = hourBefore;
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.hasGift).toBeFalsy();
            done();
        });
    });
    it('executes updates player energy operation', function (done) {
        var spyUpdateEnergy = spyOn(op, 'executeUpdateEnergyOperation').and
            .callFake(function (req, cb) {
            cb(req.player);
        });
        op.execute(function (response) {
            expect(spyUpdateEnergy).toHaveBeenCalled();
            done();
        });
    });
});
//# sourceMappingURL=getPlayerInfo.spec.js.map