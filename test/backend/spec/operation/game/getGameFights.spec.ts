/// <reference path="../../../typings/refs.d.ts" />
import getGameFightsOp = require('../../../../../backend/operation/game/getGameFightsOperation');
import mocker = require('../../../helper/operationMocker');
import playerEntity = require('../../../../../backend/entities/playerEntity');
import fightEntity = require('../../../../../backend/entities/fightEntity');
import accountEntity = require('../../../../../backend/entities/accountEntity');

describe('Get game fights',() => {
    var req: IGetGameFightsRequest;
    var op: getGameFightsOp.GetGameFightsOperation;
    var mock: mocker.IMockedOperation;
    var players: playerEntity.PlayerEntity[];
    var accounts: accountEntity.AccountEntity[];
    var fights: fightEntity.FightEntity[];
    var currentUserId = mocker.OperationMocker.getId();
    var counts = [5, 8, 22, 999];
    var currentUserPlayer: playerEntity.PlayerEntity;

    beforeEach(() => {
        req = {
            skip: 0,
            take: 10
        };
        var processedCountNr = 0;
        op = new getGameFightsOp.GetGameFightsOperation(req);
        mock = mocker.OperationMocker.mock(op);

        setupAccounts();
        setupPlayers();
        setupFights();

        mock.collectionMock.toArray = (cb) =>{
            var result;
            switch(mock.collectionMock.name){
                case playerEntity.CollectionName:
                    result = players;
                    break;
                case accountEntity.CollectionName:
                    result = accounts;
                    break;
                case fightEntity.CollectionName:
                    result = fights;
                    break;
            }
            cb(null, result);
        };

        mock.collectionMock.findOne = (doc, cb) =>{
            cb(null, currentUserPlayer);
        };

        mock.collectionMock.count = (query, cb) => {
            var result = counts[processedCountNr];
            processedCountNr++;
            cb(null, result);
        };

        spyOn(op, 'currentUserObjectId').and.callFake(() => {return currentUserId});
    });

    it('returns fights', (done) => {
        op.execute((response: IGetGameFightsResponse) => {
            expect(response.list.length).toEqual(4);
            done();
        });
    });

    it('returns total count', (done) => {
        op.execute((response: IGetGameFightsResponse) => {
            expect(response.totalCount).toEqual(999);
            done();
        });
    });

    it('returns win flag and points for outdated or over fights', (done) => {
        op.execute((response: IGetGameFightsResponse) => {
            expect(response.list[0].isWin).toBeTruthy();
            expect(response.list[3].isWin).toBeTruthy();

            expect(response.list[0].points).toEqual(1);
            expect(response.list[3].points).toEqual(2);
            done();
        });
    });

    it('returns opponent place', (done) => {
        op.execute((response: IGetGameFightsResponse) => {
            expect(response.list[0].opponentPlace).toEqual(6);
            expect(response.list[1].opponentPlace).toEqual(9);
            expect(response.list[2].opponentPlace).toEqual(23);
            expect(response.list[3].opponentPlace).toEqual(23);
            done();
        });
    });

    it('returns opponent name and picture', (done) => {
        op.execute((response: IGetGameFightsResponse) => {
            expect(response.list[0].opponentName).toEqual(accounts[0].name);
            expect(response.list[1].opponentPicture).toEqual(players[1].pictureUrl);
            done();
        });
    });

    it('returns fights that has winner', (done) => {
        var query;
        mock.collectionMock.find = (doc, cb) => {
            if (mock.collectionMock.name === fightEntity.CollectionName){
                query = doc;
            }
            return mock.collectionMock;
        };
        op.execute((response: IGetGameFightsResponse) => {
            expect(query.winnerId.$exists).toBeTruthy();
            done();
        });
    });

    it('returns no fights if user does not have registered player', (done) => {
        currentUserPlayer = null;
        op.execute((response: IGetGameFightsResponse) => {
            expect(response.error).toBeUndefined();
            expect(response.list).toBeUndefined();
            done();
        });
    });

    it('does not return points and is win flag for fights with status playing and initial', (done) => {
        op.execute((response: IGetGameFightsResponse) => {
            expect(response.error).toBeUndefined();
            expect(response.list[1].isWin).toBeUndefined();
            expect(response.list[2].isWin).toBeUndefined();
            expect(response.list[1].points).toBeUndefined();
            expect(response.list[2].points).toBeUndefined();
            done();
        });
    });

    var setupAccounts = () => {
        accounts = [];

        var account = new accountEntity.AccountEntity();
        account._id = mocker.OperationMocker.getId();
        account.name = 'Garfield';
        accounts.push(account);

        account = new accountEntity.AccountEntity();
        account._id = mocker.OperationMocker.getId();
        account.name = 'Tom';
        accounts.push(account);

        account = new accountEntity.AccountEntity();
        account._id = mocker.OperationMocker.getId();
        account.name = 'Pluto';
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

        player = new playerEntity.PlayerEntity();
        player._id = mocker.OperationMocker.getId();
        player.accountId = accounts[2]._id;
        player.points = 40;
        player.pictureUrl = '/uploads/g/player3.jpeg';
        players.push(player);

        currentUserPlayer = new playerEntity.PlayerEntity();
        currentUserPlayer._id = mocker.OperationMocker.getId();
        currentUserPlayer.accountId = currentUserId;
        currentUserPlayer.points = 99;
        currentUserPlayer.pictureUrl = '/uploads/g/player4.jpeg';
    };

    var setupFights = () => {
        fights = [];

        var fight = new fightEntity.FightEntity();
        fight._id = mocker.OperationMocker.getId();
        fight.player1Id = players[0]._id;
        fight.player2Id = currentUserPlayer._id;
        fight.player1Points = 0;
        fight.player2Points = 1;
        fight.winnerId = currentUserPlayer._id;
        fight.voterIp = '192.168.0.1';
        fight.updatedOn = new Date();
        fight.status = FightStatus.Outdated;
        fights.push(fight);

        fight = new fightEntity.FightEntity();
        fight._id = mocker.OperationMocker.getId();
        fight.player1Id = currentUserPlayer._id;
        fight.player2Id = players[1]._id;
        fight.winnerId = players[1]._id;
        fight.player1Points = -1;
        fight.player2Points = 2;
        fight.voterId = mocker.OperationMocker.getId();
        fight.updatedOn = new Date();
        fight.status = FightStatus.Initial;
        fights.push(fight);

        fight = new fightEntity.FightEntity();
        fight._id = mocker.OperationMocker.getId();
        fight.player1Id = players[2]._id;
        fight.player2Id = currentUserPlayer._id;
        fight.player1Points = -1;
        fight.player2Points = 2;
        fight.winnerId = currentUserPlayer._id;
        fight.voterId = mocker.OperationMocker.getId();
        fight.updatedOn = new Date();
        fight.status = FightStatus.Playing;
        fights.push(fight);

        fight = new fightEntity.FightEntity();
        fight._id = mocker.OperationMocker.getId();
        fight.player1Id = players[2]._id;
        fight.player2Id = currentUserPlayer._id;
        fight.player1Points = -1;
        fight.player2Points = 2;
        fight.winnerId = currentUserPlayer._id;
        fight.voterId = mocker.OperationMocker.getId();
        fight.updatedOn = new Date();
        fights.push(fight);
        fight.status = FightStatus.Over;
    };
});