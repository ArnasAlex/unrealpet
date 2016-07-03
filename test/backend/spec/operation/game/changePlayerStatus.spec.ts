/// <reference path="../../../typings/refs.d.ts" />
import changePlayerStatusOp = require('../../../../../backend/operation/game/changePlayerStatusOperation');
import mocker = require('../../../helper/operationMocker');
import playerEntity = require('../../../../../backend/entities/playerEntity');

describe('Change player status',() => {
    var req: IChangePlayerStatusRequest;
    var op: changePlayerStatusOp.ChangePlayerStatusOperation;
    var mock: mocker.IMockedOperation;
    var player: playerEntity.PlayerEntity;
    var currentUserId = mocker.OperationMocker.getId();
    var savedDoc: playerEntity.PlayerEntity;

    beforeEach(() => {
        req = {
            status: PlayerStatus.Playing
        };
        op = new changePlayerStatusOp.ChangePlayerStatusOperation(req);
        mock = mocker.OperationMocker.mock(op);
        player = new playerEntity.PlayerEntity();
        player.status = PlayerStatus.NotPlaying;

        mock.collectionMock.findOne = (query, cb) => {
            cb(null, player);
        };

        mock.collectionMock.save = (doc, cb) => {
            savedDoc = doc;
            cb(null);
        };

        spyOn(op, 'currentUserObjectId').and.callFake(() => {return currentUserId});
    });

    it('changes player status in database', (done) => {
        op.execute((response: IGetPlayerInfoResponse) => {
            expect(response.error).toBeUndefined();
            expect(savedDoc.status).toEqual(PlayerStatus.Playing);
            done();
        });
    });
});