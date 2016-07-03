/// <reference path="../../../typings/refs.d.ts" />
var chooseGameWinnerOp = require('../../../../../backend/operation/game/chooseGameWinnerOperation');
var mocker = require('../../../helper/operationMocker');
var playerEntity = require('../../../../../backend/entities/playerEntity');
var fightEntity = require('../../../../../backend/entities/fightEntity');
describe('Choose game winner', function () {
    var req;
    var op;
    var mock;
    var currentUserId = mocker.OperationMocker.getId();
    var currentUserIp = '192.168.5.1';
    var fight;
    var winnerId = mocker.OperationMocker.getId();
    var currentUserPlayer;
    var savedFight;
    var savedPlayer;
    var spyUpdateFight;
    beforeEach(function () {
        currentUserId = mocker.OperationMocker.getId();
        winnerId = mocker.OperationMocker.getId();
        req = { fightId: mocker.OperationMocker.getId().toString(), playerId: winnerId.toString() };
        op = new chooseGameWinnerOp.ChooseGameWinnerOperation(req);
        mock = mocker.OperationMocker.mock(op);
        spyOn(op, 'currentUserObjectId').and.callFake(function () { return currentUserId; });
        spyOn(op, 'currentUserIp').and.callFake(function () { return currentUserIp; });
        spyOn(op, 'executeGetGameFightOperation').and.callFake(function (cb) {
            var response = {
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
        mock.collectionMock.findOne = function (query, cb) {
            var result;
            if (mock.collectionMock.name === fightEntity.CollectionName) {
                result = fight;
            }
            else {
                result = currentUserPlayer;
            }
            cb(null, result);
        };
        mock.collectionMock.save = function (doc, cb) {
            if (mock.collectionMock.name === fightEntity.CollectionName) {
                savedFight = doc;
            }
            else {
                savedPlayer = doc;
            }
            cb(null);
        };
        spyUpdateFight = spyOn(mock.collectionMock, 'update');
        spyUpdateFight.and.callFake(function (query, update, options, cb) {
            cb(null);
        });
    });
    var setupUnregisteredUser = function () {
        currentUserId = null;
        fight.voterId = null;
        fight.voterIp = currentUserIp;
    };
    it('returns new fight id', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.id).toBeTruthy();
            done();
        });
    });
    it('does not update players and fight if winner is not from fight', function (done) {
        req.playerId = 'fakeId';
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(spyUpdateFight).not.toHaveBeenCalled();
            expect(savedFight).toBeNull();
            done();
        });
    });
    it('does not update players and fight if voter is different', function (done) {
        currentUserId = mocker.OperationMocker.getId();
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(spyUpdateFight).not.toHaveBeenCalled();
            expect(savedFight).toBeNull();
            done();
        });
    });
    it('does not update players and fight if winner already assigned to fight', function (done) {
        fight.winnerId = mocker.OperationMocker.getId();
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(spyUpdateFight).not.toHaveBeenCalled();
            expect(savedFight).toBeNull();
            done();
        });
    });
    it('saves fight with winner', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(savedFight.winnerId.toString()).toEqual(winnerId.toString());
            done();
        });
    });
    it('saves fight player points when registered user votes', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(savedFight.player1Points).toEqual(2);
            expect(savedFight.player2Points).toEqual(-1);
            done();
        });
    });
    it('saves fight player points when unregistered user votes', function (done) {
        setupUnregisteredUser();
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(savedFight.player1Points).toEqual(1);
            expect(savedFight.player2Points).toEqual(0);
            done();
        });
    });
    it('saves player points', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(savedFight.player1Points).toEqual(2);
            expect(savedFight.player2Points).toEqual(-1);
            done();
        });
    });
    it('sets fight to initial status', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(savedFight.status).toEqual(1);
            done();
        });
    });
    it('updates both players fight count', function (done) {
        var update;
        var query;
        mock.collectionMock.update = function (q, u, options, cb) {
            update = u;
            query = q;
            cb(null);
        };
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(update).toBeTruthy();
            expect(update.$inc.fights).toEqual(1);
            expect(query._id.$in[0].toString()).toEqual(fight.player1Id.toString());
            expect(query._id.$in[1].toString()).toEqual(fight.player2Id.toString());
            done();
        });
    });
    it('increments current player energy if it is less than available', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(savedPlayer.energy).toEqual(11);
            done();
        });
    });
    it('does not increment current player energy if it is same as available energy', function (done) {
        currentUserPlayer.energy = currentUserPlayer.availableEnergy;
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(savedPlayer).toBeNull();
            done();
        });
    });
});
//# sourceMappingURL=chooseGameWinner.spec.js.map