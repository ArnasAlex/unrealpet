/// <reference path="../../../typings/refs.d.ts" />
import getGameLeadersOp = require('../../../../../backend/operation/game/getGameLeadersOperation');
import mocker = require('../../../helper/operationMocker');
import playerEntity = require('../../../../../backend/entities/playerEntity');
import accountEntity = require('../../../../../backend/entities/accountEntity');

describe('Get game fight',() => {
    var req: IGetGameLeadersRequest;
    var op: getGameLeadersOp.GetGameLeadersOperation;
    var mock: mocker.IMockedOperation;
    var players: playerEntity.PlayerEntity[];
    var accounts: accountEntity.AccountEntity[];

    beforeEach(() => {
        req = {
            skip: 10,
            take: 10
        };

        op = new getGameLeadersOp.GetGameLeadersOperation(req);
        mock = mocker.OperationMocker.mock(op);

        setupAccounts();
        setupPlayers();

        mock.collectionMock.toArray = (cb) =>{
            var result = mock.collectionMock.name === playerEntity.CollectionName
                ? players
                : accounts;
            cb(null, result);
        };

        mock.collectionMock.count = (query, cb) => {
            cb(null, 50);
        };
    });

    var setupAccounts = () => {
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

    var setupPlayers = () => {
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

    it('returns players', (done) => {
        op.execute((response: IGetGameLeadersResponse) => {
            expect(response.error).toBeUndefined();
            expect(response.list.length).toBeGreaterThan(0);
            done();
        });
    });

    it('returns place', (done) => {
        op.execute((response: IGetGameLeadersResponse) => {
            expect(response.list[0].place).toEqual(11);
            expect(response.list[1].place).toEqual(12);
            done();
        });
    });

    it('returns account info', (done) => {
        op.execute((response: IGetGameLeadersResponse) => {
            expect(response.list[0].picture).toEqual('/uploads/pic.jpeg');
            expect(response.list[0].name).toEqual('Garfield');
            done();
        });
    });

    it('returns points', (done) => {
        op.execute((response: IGetGameLeadersResponse) => {
            expect(response.list[0].points).toEqual(20);
            done();
        });
    });
});