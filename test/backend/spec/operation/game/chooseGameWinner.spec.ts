/// <reference path="../../../typings/refs.d.ts" />
import chooseGameWinnerOp = require('../../../../../backend/operation/game/chooseGameWinnerOperation');
import mocker = require('../../../helper/operationMocker');
import playerEntity = require('../../../../../backend/entities/playerEntity');
import fightEntity = require('../../../../../backend/entities/fightEntity');

describe('Choose game winner', () => {
    var req: IChooseGameWinnerRequest;
    var op: chooseGameWinnerOp.ChooseGameWinnerOperation;
    var mock: mocker.IMockedOperation;
    var currentUserId = mocker.OperationMocker.getId();
    var currentUserIp = '192.168.5.1';
    var fight: fightEntity.FightEntity;
    var winnerId = mocker.OperationMocker.getId();
    var currentUserPlayer: playerEntity.PlayerEntity;
    var savedFight: fightEntity.FightEntity;
    var savedPlayer: playerEntity.PlayerEntity;
    var spyUpdateFight: jasmine.Spy;

    beforeEach(() => {
        currentUserId = mocker.OperationMocker.getId();
        winnerId = mocker.OperationMocker.getId();
        req = { fightId: mocker.OperationMocker.getId().toString(), playerId: winnerId.toString() };

        op = new chooseGameWinnerOp.ChooseGameWinnerOperation(req);
        mock = mocker.OperationMocker.mock(op);

        spyOn(op, 'currentUserObjectId').and.callFake(() => {return currentUserId});
        spyOn(op, 'currentUserIp').and.callFake(() => {return currentUserIp});
        spyOn(op, 'executeGetGameFightOperation').and.callFake((cb) => {
            var response: IGetGameFightResponse = {
                id: 'someId',
                players: []
            };

            op['response'] = response;
            cb(null);
        });

        fight = new fightEntity.FightEntity();
        fight._id = mocker.OperationMocker.getId();
        fight.player1Id = winnerId;
        fight.player2Id = mocker.OperationMocker.getId();
        fight.voterId = currentUserId;

        currentUserPlayer = new playerEntity.PlayerEntity();
        currentUserPlayer.energy = 10;
        currentUserPlayer.availableEnergy = 15;

        savedFight = null;
        savedPlayer = null;

        mock.collectionMock.findOne = (query, cb) => {
            var result;
            if (mock.collectionMock.name === fightEntity.CollectionName){
                result = fight;
            }
            else {
                result = currentUserPlayer;
            }
            cb(null, result);
        };

        mock.collectionMock.save = (doc, cb) => {
            if (mock.collectionMock.name === fightEntity.CollectionName){
                savedFight = doc;
            }
            else {
                savedPlayer = doc;
            }
            cb(null);
        };

        spyUpdateFight = spyOn(mock.collectionMock, 'update');
        spyUpdateFight.and.callFake((query, update, options, cb) => {
            cb(null);
        });
    });

    var setupUnregisteredUser = () => {
        currentUserId = null;
        fight.voterId = null;
        fight.voterIp = currentUserIp;
    };

    it('returns new fight id', (done) => {
        op.execute((response: IGetGameFightResponse) => {
            expect(response.error).toBeUndefined();
            expect(response.id).toBeTruthy();
            done();
        });
    });

    it('does not update players and fight if winner is not from fight', (done) => {
        req.playerId = 'fakeId';

        op.execute((response: IGetGameFightResponse) => {
            expect(response.error).toBeUndefined();
            expect(spyUpdateFight).not.toHaveBeenCalled();
            expect(savedFight).toBeNull();
            done();
        });
    });

    it('does not update players and fight if voter is different', (done) => {
        currentUserId = mocker.OperationMocker.getId();

        op.execute((response: IGetGameFightResponse) => {
            expect(response.error).toBeUndefined();
            expect(spyUpdateFight).not.toHaveBeenCalled();
            expect(savedFight).toBeNull();
            done();
        });
    });

    it('does not update players and fight if winner already assigned to fight', (done) => {
        fight.winnerId = mocker.OperationMocker.getId();

        op.execute((response: IGetGameFightResponse) => {
            expect(response.error).toBeUndefined();
            expect(spyUpdateFight).not.toHaveBeenCalled();
            expect(savedFight).toBeNull();
            done();
        });
    });

    it('saves fight with winner', (done) => {
        op.execute((response: IGetGameFightResponse) => {
            expect(response.error).toBeUndefined();
            expect(savedFight.winnerId.toString()).toEqual(winnerId.toString());
            done();
        });
    });

    it('saves fight player points when registered user votes', (done) => {
        op.execute((response: IGetGameFightResponse) => {
            expect(response.error).toBeUndefined();
            expect(savedFight.player1Points).toEqual(2);
            expect(savedFight.player2Points).toEqual(-1);
            done();
        });
    });

    it('saves fight player points when unregistered user votes', (done) => {
        setupUnregisteredUser();
        op.execute((response: IGetGameFightResponse) => {
            expect(response.error).toBeUndefined();
            expect(savedFight.player1Points).toEqual(1);
            expect(savedFight.player2Points).toEqual(0);
            done();
        });
    });

    it('saves player points', (done) => {
        op.execute((response: IGetGameFightResponse) => {
            expect(response.error).toBeUndefined();
            expect(savedFight.player1Points).toEqual(2);
            expect(savedFight.player2Points).toEqual(-1);
            done();
        });
    });

    it('sets fight to initial status', (done) => {
        op.execute((response: IGetGameFightResponse) => {
            expect(response.error).toBeUndefined();
            expect(savedFight.status).toEqual(FightStatus.Initial);
            done();
        });
    });

    it('updates both players fight count', (done) => {
        var update;
        var query;
        mock.collectionMock.update = (q, u, options, cb) => {
            update = u;
            query = q;
            cb(null);
        };

        op.execute((response: IGetGameFightResponse) => {
            expect(response.error).toBeUndefined();
            expect(update).toBeTruthy();
            expect(update.$inc.fights).toEqual(1);
            expect(query._id.$in[0].toString()).toEqual(fight.player1Id.toString());
            expect(query._id.$in[1].toString()).toEqual(fight.player2Id.toString());
            done();
        });
    });

    it('increments current player energy if it is less than available', (done) => {
        op.execute((response: IGetGameFightResponse) => {
            expect(response.error).toBeUndefined();
            expect(savedPlayer.energy).toEqual(11);
            done();
        });
    });

    it('does not increment current player energy if it is same as available energy', (done) => {
        currentUserPlayer.energy = currentUserPlayer.availableEnergy;
        op.execute((response: IGetGameFightResponse) => {
            expect(response.error).toBeUndefined();
            expect(savedPlayer).toBeNull();
            done();
        });
    });
});