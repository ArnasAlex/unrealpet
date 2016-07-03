/// <reference path="../../../typings/refs.d.ts" />
import getPlayerEnergyOp = require('../../../../../backend/operation/game/getPlayerEnergyOperation');
import mocker = require('../../../helper/operationMocker');
import playerEntity = require('../../../../../backend/entities/playerEntity');

describe('Get player energy',() => {
    var req: IGetPlayerEnergyRequest;
    var op: getPlayerEnergyOp.GetPlayerEnergyOperation;
    var mock: mocker.IMockedOperation;
    var player: playerEntity.PlayerEntity;
    var spyUpdateEnergy: jasmine.Spy;

    beforeEach(() => {
        player = new playerEntity.PlayerEntity();
        player.pictureUrl = '/uploads/g/picture.jpeg';
        player.points = 99;
        player.fights = 100;
        player.win = 80;
        player.defeat = 20;
        player.status = PlayerStatus.Playing;
        player.energy = 10;
        player.availableEnergy = 15;

        req = { player: player };
        op = new getPlayerEnergyOp.GetPlayerEnergyOperation(req);
        mock = mocker.OperationMocker.mock(op);

        mock.collectionMock.findOne = (doc, cb) => {
            cb(null, player);
        };

        spyUpdateEnergy = spyOn(op, 'executeUpdateEnergyOperation');
        spyUpdateEnergy.and.callFake((req, cb) => {
            cb({});
        });
    });

    it('executes update player energy operation', (done) => {
        op.execute((response: IGetPlayerEnergyResponse) => {
            expect(response.error).toBeUndefined();
            expect(spyUpdateEnergy).toHaveBeenCalled();
            done();
        });
    });

    it('returns player energy and available energy', (done) => {
        op.execute((response: IGetPlayerEnergyResponse) => {
            expect(response.error).toBeUndefined();
            expect(response.energy).toEqual(10);
            expect(response.availableEnergy).toEqual(15);
            done();
        });
    });
});