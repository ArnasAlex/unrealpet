/// <reference path="../../../typings/refs.d.ts" />
var getGameFightOp = require('../../../../../backend/operation/game/getGameFightOperation');
var mocker = require('../../../helper/operationMocker');
var playerEntity = require('../../../../../backend/entities/playerEntity');
describe('Get game fight', function () {
    var req;
    var op;
    var mock;
    var players;
    var currentUserId = mocker.OperationMocker.getId();
    var currentUserIp = '192.168.5.1';
    var counts = [5, 8, 22];
    beforeEach(function () {
        req = {};
        var processedCountNr = 0;
        op = new getGameFightOp.GetGameFightOperation(req);
        mock = mocker.OperationMocker.mock(op);
        setupPlayers();
        mock.collectionMock.toArray = function (cb) {
            cb(null, players);
        };
        mock.collectionMock.count = function (query, cb) {
            var result = counts[processedCountNr];
            processedCountNr++;
            cb(null, result);
        };
        spyOn(op, 'currentUserObjectId').and.callFake(function () { return currentUserId; });
        spyOn(op, 'currentUserIp').and.callFake(function () { return currentUserIp; });
    });
    var setupPlayers = function () {
        players = [];
        var player = new playerEntity.PlayerEntity();
        player._id = mocker.OperationMocker.getId();
        player.accountId = mocker.OperationMocker.getId();
        player.points = 20;
        player.pictureUrl = '/uploads/g/player1.jpeg';
        players.push(player);
        player = new playerEntity.PlayerEntity();
        player._id = mocker.OperationMocker.getId();
        player.accountId = mocker.OperationMocker.getId();
        player.points = 30;
        player.pictureUrl = '/uploads/g/player2.jpeg';
        players.push(player);
        player = new playerEntity.PlayerEntity();
        player._id = mocker.OperationMocker.getId();
        player.accountId = mocker.OperationMocker.getId();
        player.points = 30;
        player.pictureUrl = '/uploads/g/player3.jpeg';
        players.push(player);
    };
    it('returns fight id', function (done) {
        op.execute(function (response) {
            expect(response.id).toBeTruthy();
            done();
        });
    });
    it('returns first player info', function (done) {
        op.execute(function (response) {
            expect(response.players[0].id).toBeTruthy();
            expect(response.players[0].picture).toBeTruthy();
            expect(response.players[0].place).toBeGreaterThan(3);
            done();
        });
    });
    it('returns second player info', function (done) {
        op.execute(function (response) {
            expect(response.players[1].id).toBeTruthy();
            expect(response.players[1].picture).toBeTruthy();
            expect(response.players[1].place).toBeGreaterThan(4);
            done();
        });
    });
    it('players are not the same', function (done) {
        op.execute(function (response) {
            expect(response.players[0].id).not.toEqual(response.players[1].id);
            expect(response.players[0].picture).not.toEqual(response.players[1].picture);
            expect(response.players[0].place).not.toEqual(response.players[1].place);
            done();
        });
    });
    it('gets players that had no fights for the longest time', function (done) {
        var query;
        mock.collectionMock.sort = function (q) {
            query = q;
            return mock.collectionMock;
        };
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(query.lastFightOn).toEqual(1);
            done();
        });
    });
    it('excludes current user in player search', function (done) {
        var query;
        mock.collectionMock.find = function (q, cb) {
            query = q;
            return mock.collectionMock;
        };
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(query.accountId.$not.$eq).toEqual(currentUserId);
            done();
        });
    });
    it('searches for players that has status Playing', function (done) {
        var query;
        mock.collectionMock.find = function (q, cb) {
            query = q;
            return mock.collectionMock;
        };
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(query.status).toEqual(1);
            done();
        });
    });
    it('creates fight in database with player ids', function (done) {
        var savedFight;
        mock.collectionMock.save = function (doc, cb) {
            savedFight = doc;
            cb(null);
        };
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(savedFight.player1Id.toString()).toEqual(response.players[0].id);
            expect(savedFight.player2Id.toString()).toEqual(response.players[1].id);
            done();
        });
    });
    it('creates fight in database with current user id as voter id for registered user', function (done) {
        var savedFight;
        mock.collectionMock.save = function (doc, cb) {
            savedFight = doc;
            cb(null);
        };
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(savedFight.voterId.toString()).toEqual(currentUserId.toString());
            expect(savedFight.voterIp).toBeFalsy();
            done();
        });
    });
    it('creates fight in database with ip of current user as voter ip for not registered user', function (done) {
        currentUserId = null;
        var savedFight;
        mock.collectionMock.save = function (doc, cb) {
            savedFight = doc;
            cb(null);
        };
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(savedFight.voterId).toBeFalsy();
            expect(savedFight.voterIp).toEqual(currentUserIp);
            done();
        });
    });
    it('updates players lastFighOn in database', function (done) {
        var query, update;
        mock.collectionMock.update = function (q, u, options, cb) {
            query = q;
            update = u;
            cb(null);
        };
        op.execute(function (response) {
            expect(query._id.$in).toContain(mocker.OperationMocker.getObjectId(response.players[0].id));
            expect(query._id.$in).toContain(mocker.OperationMocker.getObjectId(response.players[1].id));
            expect(update.$set.lastFightOn).toBeTruthy();
            done();
        });
    });
    it('returns no fight id or players if at least 2 playing players was not found', function (done) {
        mock.collectionMock.toArray = function (cb) {
            cb(null, [players[0]]);
        };
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.id).toBeUndefined();
            done();
        });
    });
});
//# sourceMappingURL=getGameFight.spec.js.map