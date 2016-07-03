/// <reference path="../../../typings/refs.d.ts" />
var getGameLeadersOp = require('../../../../../backend/operation/game/getGameLeadersOperation');
var mocker = require('../../../helper/operationMocker');
var playerEntity = require('../../../../../backend/entities/playerEntity');
var accountEntity = require('../../../../../backend/entities/accountEntity');
describe('Get game fight', function () {
    var req;
    var op;
    var mock;
    var players;
    var accounts;
    beforeEach(function () {
        req = {
            skip: 10,
            take: 10
        };
        op = new getGameLeadersOp.GetGameLeadersOperation(req);
        mock = mocker.OperationMocker.mock(op);
        setupAccounts();
        setupPlayers();
        mock.collectionMock.toArray = function (cb) {
            var result = mock.collectionMock.name === playerEntity.CollectionName
                ? players
                : accounts;
            cb(null, result);
        };
        mock.collectionMock.count = function (query, cb) {
            cb(null, 50);
        };
    });
    var setupAccounts = function () {
        accounts = [];
        var account = new accountEntity.AccountEntity();
        account._id = mocker.OperationMocker.getId();
        account.logo = '/uploads/pic.jpeg';
        account.name = 'Garfield';
        accounts.push(account);
        var account = new accountEntity.AccountEntity();
        account._id = mocker.OperationMocker.getId();
        account.logo = '/uploads/pic2.jpeg';
        account.name = 'Tom';
        accounts.push(account);
    };
    var setupPlayers = function () {
        players = [];
        var player = new playerEntity.PlayerEntity();
        player._id = mocker.OperationMocker.getId();
        player.accountId = accounts[0]._id;
        player.points = 20;
        player.pictureUrl = '/uploads/g/player1.jpeg';
        players.push(player);
        player = new playerEntity.PlayerEntity();
        player._id = mocker.OperationMocker.getId();
        player.accountId = accounts[1]._id;
        player.points = 30;
        player.pictureUrl = '/uploads/g/player2.jpeg';
        players.push(player);
    };
    it('returns players', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.list.length).toBeGreaterThan(0);
            done();
        });
    });
    it('returns place', function (done) {
        op.execute(function (response) {
            expect(response.list[0].place).toEqual(11);
            expect(response.list[1].place).toEqual(12);
            done();
        });
    });
    it('returns account info', function (done) {
        op.execute(function (response) {
            expect(response.list[0].picture).toEqual('/uploads/pic.jpeg');
            expect(response.list[0].name).toEqual('Garfield');
            done();
        });
    });
    it('returns points', function (done) {
        op.execute(function (response) {
            expect(response.list[0].points).toEqual(20);
            done();
        });
    });
});
//# sourceMappingURL=getGameLeaders.spec.js.map