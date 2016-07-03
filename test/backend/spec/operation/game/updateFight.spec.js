/// <reference path="../../../typings/refs.d.ts" />
var updateFightOp = require('../../../../../backend/operation/game/updateFightOperation');
var mocker = require('../../../helper/operationMocker');
var playerEntity = require('../../../../../backend/entities/playerEntity');
var fightEntity = require('../../../../../backend/entities/fightEntity');
describe('Update game fight', function () {
    var req;
    var op;
    var mock;
    var currentUserId = mocker.OperationMocker.getId();
    var fight;
    var players;
    var savedFight;
    var savedPlayers;
    var random = 0;
    beforeEach(function () {
        currentUserId = mocker.OperationMocker.getId();
        setupPlayers();
        fight = new fightEntity.FightEntity();
        fight._id = mocker.OperationMocker.getId();
        fight.player1Id = players[0]._id;
        fight.player1Points = 2;
        fight.player2Id = players[1]._id;
        fight.player2Points = -1;
        fight.winnerId = fight.player1Id;
        fight.status = 1;
        fight.playerId = players[0]._id;
        req = {
            id: fight._id.toString(),
            skill: 3,
            guessingSelf: false
        };
        setup();
    });
    var setup = function () {
        op = new updateFightOp.UpdateFightOperation(req);
        mock = mocker.OperationMocker.mock(op);
        mock.collectionMock.toArray = function (cb) {
            cb(null, players);
        };
        mock.collectionMock.findOne = function (query, cb) {
            cb(null, fight);
        };
        savedPlayers = [];
        mock.collectionMock.save = function (doc, cb) {
            if (mock.collectionMock.name === fightEntity.CollectionName) {
                savedFight = doc;
            }
            else {
                savedPlayers.push(doc);
            }
            cb(null, doc);
        };
        spyOn(op, 'currentUserObjectId').and.callFake(function () { return currentUserId; });
        spyOn(op, 'currentUserId').and.callFake(function () { return currentUserId.toString(); });
        random = 0;
        spyOn(op, 'getRandomBetween').and.callFake(function () {
            return random;
        });
    };
    var setupPlayers = function () {
        players = [];
        var player = new playerEntity.PlayerEntity();
        player._id = mocker.OperationMocker.getId();
        player.accountId = currentUserId;
        player.energy = 10;
        player.points = 100;
        player.win = 50;
        player.defeat = 50;
        players.push(player);
        player = new playerEntity.PlayerEntity();
        player._id = mocker.OperationMocker.getId();
        player.accountId = mocker.OperationMocker.getId();
        player.energy = 6;
        player.points = 200;
        player.win = 100;
        player.defeat = 100;
        players.push(player);
    };
    it('returns remaining player energy', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.energy).toEqual(6);
            done();
        });
    });
    it('returns original points', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.originalPoints.opponent).toEqual(-1);
            expect(response.originalPoints.player).toEqual(2);
            done();
        });
    });
    it('returns modified points', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.modifiedPoints.opponent).toEqual(-2);
            expect(response.modifiedPoints.player).toEqual(4);
            done();
        });
    });
    it('returns win flag', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.isWinner).toBeTruthy();
            done();
        });
    });
    it('sets fight to over status', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(savedFight.status).toEqual(3);
            done();
        });
    });
    it('updates fight points', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(savedFight.player1Points).toEqual(4);
            expect(savedFight.player2Points).toEqual(-2);
            done();
        });
    });
    it('updates player1', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(savedPlayers[0].points).toEqual(104);
            expect(savedPlayers[0].defeat).toEqual(50);
            expect(savedPlayers[0].win).toEqual(51);
            done();
        });
    });
    it('updates player2', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(savedPlayers[1].points).toEqual(198);
            expect(savedPlayers[1].defeat).toEqual(101);
            expect(savedPlayers[1].win).toEqual(100);
            done();
        });
    });
    it('counts points and energy on bomb skill', function (done) {
        req.skill = 1;
        random = 5;
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.modifiedPoints.player).toEqual(2);
            expect(response.modifiedPoints.opponent).toEqual(-1 - random);
            expect(response.energy).toEqual(5);
            done();
        });
    });
    it('counts points and energy on double points skill', function (done) {
        req.skill = 3;
        random = 1;
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.modifiedPoints.player).toEqual(4 + random);
            expect(response.modifiedPoints.opponent).toEqual(-2 - random);
            expect(response.energy).toEqual(6);
            done();
        });
    });
    it('counts points and energy on turn around skill', function (done) {
        req.skill = 0;
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.modifiedPoints.player).toEqual(-1);
            expect(response.modifiedPoints.opponent).toEqual(2);
            expect(response.isWinner).toBeFalsy();
            expect(response.energy).toEqual(8);
            expect(savedFight.winnerId.toString()).toEqual(players[1]._id.toString());
            done();
        });
    });
    it('counts points and energy on guessing winner skill', function (done) {
        req.skill = 2;
        req.guessingSelf = true;
        random = 2;
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.modifiedPoints.player).toEqual(2 + random);
            expect(response.modifiedPoints.opponent).toEqual(-1);
            expect(response.energy).toEqual(9);
            done();
        });
    });
    it('counts points on guessing winner skill when not guessing right', function (done) {
        req.skill = 2;
        req.guessingSelf = false;
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.modifiedPoints.player).toEqual(2);
            expect(response.modifiedPoints.opponent).toEqual(-1);
            done();
        });
    });
    it('reduces energy and available energy', function (done) {
        req.skill = 1;
        players[0].energy = 12;
        players[0].availableEnergy = 16;
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.energy).toEqual(7);
            expect(players[0].availableEnergy).toEqual(11);
            done();
        });
    });
    it('does not reduce available energy less than 1', function (done) {
        req.skill = 0;
        players[0].energy = 2;
        players[0].availableEnergy = 2;
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.energy).toEqual(0);
            expect(players[0].availableEnergy).toEqual(1);
            done();
        });
    });
    it('does not allow play skill if player has not enough energy', function (done) {
        req.skill = 1;
        players[0].energy = 2;
        op.execute(function (response) {
            expect(response.error).toEqual('Not enough energy');
            done();
        });
    });
    it('chooses winner which was originally if players have same points', function (done) {
        req.skill = 2;
        fight.player1Points = 0;
        fight.player2Points = 1;
        fight.winnerId = players[1]._id;
        random = 1;
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.isWinner).toBeFalsy();
            expect(response.modifiedPoints.opponent).toEqual(1);
            expect(response.modifiedPoints.player).toEqual(1);
            done();
        });
    });
    it('does not allow play if it was played', function (done) {
        fight.status = 3;
        op.execute(function (response) {
            expect(response.error).not.toBeUndefined();
            done();
        });
    });
});
//# sourceMappingURL=updateFight.spec.js.map