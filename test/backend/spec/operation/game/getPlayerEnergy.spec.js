/// <reference path="../../../typings/refs.d.ts" />
var getPlayerEnergyOp = require('../../../../../backend/operation/game/getPlayerEnergyOperation');
var mocker = require('../../../helper/operationMocker');
var playerEntity = require('../../../../../backend/entities/playerEntity');
describe('Get player energy', function () {
    var req;
    var op;
    var mock;
    var player;
    var spyUpdateEnergy;
    beforeEach(function () {
        player = new playerEntity.PlayerEntity();
        player.pictureUrl = '/uploads/g/picture.jpeg';
        player.points = 99;
        player.fights = 100;
        player.win = 80;
        player.defeat = 20;
        player.status = 1;
        player.energy = 10;
        player.availableEnergy = 15;
        req = { player: player };
        op = new getPlayerEnergyOp.GetPlayerEnergyOperation(req);
        mock = mocker.OperationMocker.mock(op);
        mock.collectionMock.findOne = function (doc, cb) {
            cb(null, player);
        };
        spyUpdateEnergy = spyOn(op, 'executeUpdateEnergyOperation');
        spyUpdateEnergy.and.callFake(function (req, cb) {
            cb({});
        });
    });
    it('executes update player energy operation', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(spyUpdateEnergy).toHaveBeenCalled();
            done();
        });
    });
    it('returns player energy and available energy', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.energy).toEqual(10);
            expect(response.availableEnergy).toEqual(15);
            done();
        });
    });
});
//# sourceMappingURL=getPlayerEnergy.spec.js.map