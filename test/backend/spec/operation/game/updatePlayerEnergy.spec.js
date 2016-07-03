/// <reference path="../../../typings/refs.d.ts" />
var updatePlayerOp = require('../../../../../backend/operation/game/updatePlayerEnergyOperation');
var mocker = require('../../../helper/operationMocker');
var playerEntity = require('../../../../../backend/entities/playerEntity');
describe('Update player energy', function () {
    var req;
    var op;
    var mock;
    var player;
    var savedDoc;
    beforeEach(function () {
        player = new playerEntity.PlayerEntity();
        player.pictureUrl = '/uploads/g/picture.jpeg';
        player.points = 99;
        player.fights = 100;
        player.win = 80;
        player.defeat = 20;
        player.status = 1;
        req = { player: player };
        op = new updatePlayerOp.UpdatePlayerEnergyOperation(req);
        mock = mocker.OperationMocker.mock(op);
        savedDoc = null;
        mock.collectionMock.save = function (doc, cb) {
            savedDoc = doc;
            cb();
        };
    });
    it('saves energy and available energy for player if it is not set', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(savedDoc.energy).toEqual(1);
            expect(savedDoc.availableEnergy).toEqual(20);
            done();
        });
    });
    it('updates player available energy if enough time passed', function (done) {
        player.availableEnergy = 2;
        var now = new Date().getTime();
        var minusCoupleIncrements = now - (playerEntity.PlayerEntity.energyIncrementTime * 2) - 10;
        player.energyIncreasedOn = new Date(minusCoupleIncrements).toISOString();
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(savedDoc.availableEnergy).toEqual(4);
            var expectedEnergyIncreasedOn = now - 10;
            expect(savedDoc.energyIncreasedOn.getTime() - expectedEnergyIncreasedOn).toEqual(0);
            done();
        });
    });
    it('does not update energy if player has max energy', function (done) {
        player.availableEnergy = playerEntity.PlayerEntity.maxEnergy;
        var saveSpy = spyOn(mock.collectionMock, 'save');
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(saveSpy).not.toHaveBeenCalled();
            done();
        });
    });
    it('does not update player energy if not enough time passed', function (done) {
        player.availableEnergy = 3;
        var now = new Date().getTime();
        var almostOneIncrementPassed = now - playerEntity.PlayerEntity.energyIncrementTime + 10;
        player.energyIncreasedOn = new Date(almostOneIncrementPassed).toISOString();
        var saveSpy = spyOn(mock.collectionMock, 'save');
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(saveSpy).not.toHaveBeenCalled();
            done();
        });
    });
    it('does not increment available energy more than max', function (done) {
        player.availableEnergy = 18;
        var now = new Date().getTime();
        var aLotOfTimePassed = now - (playerEntity.PlayerEntity.energyIncrementTime * 30);
        var increasedOn = new Date(aLotOfTimePassed);
        player.energyIncreasedOn = increasedOn.toISOString();
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(savedDoc.availableEnergy).toEqual(20);
            expect(savedDoc.energyIncreasedOn.getTime()).not.toEqual(increasedOn.getTime());
            done();
        });
    });
});
//# sourceMappingURL=updatePlayerEnergy.spec.js.map