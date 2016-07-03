/// <reference path="../../../typings/refs.d.ts" />
import getPlayerInfoOp = require('../../../../../backend/operation/game/getPlayerInfoOperation');
import updatePlayerEnergyOp = require('../../../../../backend/operation/game/updatePlayerEnergyOperation');
import mocker = require('../../../helper/operationMocker');
import playerEntity = require('../../../../../backend/entities/playerEntity');

describe('Get player info',() => {
    var req: IGetPlayerInfoRequest;
    var op: getPlayerInfoOp.GetPlayerInfoOperation;
    var mock: mocker.IMockedOperation;
    var player: playerEntity.PlayerEntity;
    var currentUserId = mocker.OperationMocker.getId();

    beforeEach(() => {
        req = {};
        op = new getPlayerInfoOp.GetPlayerInfoOperation(req);
        mock = mocker.OperationMocker.mock(op);
        player = new playerEntity.PlayerEntity();
        player.pictureUrl = '/uploads/g/picture.jpeg';
        player.points = 99;
        player.fights = 100;
        player.win = 80;
        player.defeat = 20;
        player.status = PlayerStatus.Playing;

        var playerCount = 1000;
        var playersWithMorePoints = 33;

        mock.collectionMock.count = (query, cb) => {
            var result = playerCount;
            if (query.points){
                result = playersWithMorePoints;
            }
            cb(null, result);
        };

        mock.collectionMock.findOne = (query, cb) => {
            cb(null, player);
        };

        spyOn(op, 'currentUserObjectId').and.callFake(() => {return currentUserId});
    });

    it('returns player information', (done) => {
        op.execute((response: IGetPlayerInfoResponse) => {
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

    it('returns total player count', (done) => {
        op.execute((response: IGetPlayerInfoResponse) => {
            expect(response.error).toBeUndefined();
            expect(response.totalPlayers).toEqual(1000);
            done();
        });
    });

    it('returns player place', (done) => {
        op.execute((response: IGetPlayerInfoResponse) => {
            expect(response.error).toBeUndefined();
            expect(response.place).toEqual(34);
            done();
        });
    });

    it('returns not registered if no player is found', (done) => {
        player = null;
        op.execute((response: IGetPlayerInfoResponse) => {
            expect(response.error).toBeUndefined();
            expect(response.isRegistered).toBeFalsy();
            done();
        });
    });

    it('returns gift if never recieved one', (done) => {
        op.execute((response: IGetPlayerInfoResponse) => {
            expect(response.error).toBeUndefined();
            expect(response.hasGift).toBeTruthy();
            done();
        });
    });

    it('returns gift if it arrived hour before', (done) => {
        var hourBefore = new Date();
        hourBefore.setHours(hourBefore.getHours() - 1);

        player.giftArrivesOn = hourBefore;
        op.execute((response: IGetPlayerInfoResponse) => {
            expect(response.error).toBeUndefined();
            expect(response.hasGift).toBeTruthy();
            done();
        });
    });

    it('returns no gift if it arrives after hour', (done) => {
        var hourBefore = new Date();
        hourBefore.setHours(hourBefore.getHours() + 1);

        player.giftArrivesOn = hourBefore;
        op.execute((response: IGetPlayerInfoResponse) => {
            expect(response.error).toBeUndefined();
            expect(response.hasGift).toBeFalsy();
            done();
        });
    });

    it('executes updates player energy operation', (done) => {
        var spyUpdateEnergy = spyOn(op, 'executeUpdateEnergyOperation').and
            .callFake((req: updatePlayerEnergyOp.IUpdatePlayerEnergyRequest, cb) => {
            cb(req.player);
        });

        op.execute((response: IGetPlayerInfoResponse) => {
            expect(spyUpdateEnergy).toHaveBeenCalled();
            done();
        });
    });
});