/// <reference path="../../../typings/refs.d.ts" />
import getConOp = require('../../../../../backend/operation/admin/getConnectionsOperation');
import account = require('../../../../../backend/entities/accountEntity');
import connection = require('../../../../../backend/entities/connectionEntity');
import mocker = require('../../../helper/operationMocker');

describe('Get connections',() => {
    var req: IGetConnectionsRequest;
    var op: getConOp.GetConnectionsOperation;
    var mock: mocker.IMockedOperation;
    var connections: connection.ConnectionEntity[];
    var accounts: account.AccountEntity[];

    beforeEach(() => {
        req = {
            filter: 'some action',
            skip: 5,
            take: 10
        };
        op = new getConOp.GetConnectionsOperation(req);
        mock = mocker.OperationMocker.mock(op);
        setupAccounts();
        setupConnections();

        mock.collectionMock.toArray = (cb) => {
            cb(null, connections);
        };
    });

    it('returns list of connections', (done) => {
        op.execute((response: IGetConnectionsResponse) => {
            expect(response.error).toBeNull();
            expect(response.list.length).toEqual(3);
            done();
        });
    });

    it('returns connection info', (done) => {
        op.execute((response: IGetConnectionsResponse) => {
            expect(response.error).toBeNull();
            expect(response.list[0].date).toEqual(connections[0].createdOn);
            expect(response.list[1].ip).toEqual(connections[1].ip);
            done();
        });
    });

    it('sorts by creation date', (done) => {
        var sort: any;
        mock.collectionMock.sort = (doc) => {
            sort = doc;
            return mock.collectionMock;
        };

        op.execute((response: IGetConnectionsResponse) => {
            expect(response.error).toBeNull();
            expect(sort.createdOn).toEqual(-1);
            done();
        });
    });

    it('has paging', (done) => {
        var skip = 0;
        var take = 0;
        mock.collectionMock.limit = (count) => {
            take = count;
            return mock.collectionMock;
        };

        mock.collectionMock.skip = (count) => {
            skip = count;
            return mock.collectionMock;
        };

        op.execute((response: IGetConnectionsResponse) => {
            expect(response.error).toBeNull();
            expect(take).toEqual(req.take);
            expect(skip).toEqual(req.skip);
            done();
        });
    });

    it('fills owner name', (done) => {
        op.execute((response: IGetConnectionsResponse) => {
            expect(response.error).toBeNull();
            expect(response.list[0].accountName).toEqual(accounts[0].name);
            expect(response.list[1].accountName).toEqual(undefined);
            expect(response.list[2].accountName).toEqual(accounts[1].name);
            done();
        });
    });

    it('filters by ip and action', (done) => {
        var filter;
        mock.collectionMock.find = function (doc) {
            if (mock.collectionMock.name === connection.CollectionName){
                filter = doc;
            }

            return this;
        };
        op.execute((response: IGetConnectionsResponse) => {
            expect(response.error).toBeNull();
            expect(filter.$or[0].ip).toEqual(/some action/i);
            expect(filter.$or[1].action).toEqual(/some action/i);
            done();
        });
    });

    it('returns total count for first page', (done) => {
        var count = 5;
        req = {
            filter: 'some action',
            skip: 0,
            take: 10
        };
        op = new getConOp.GetConnectionsOperation(req);
        mock = mocker.OperationMocker.mock(op);
        mock.collectionMock.count = (applySkip, cb) => {
            cb(null, count);
        };

        op.execute((response: IGetConnectionsResponse) => {
            expect(response.error).toBeNull();
            expect(response.totalCount).toEqual(count);
            done();
        });
    });

    var setupAccounts = () => {
        var owner1 = new account.AccountEntity();
        owner1._id = mocker.OperationMocker.getId();
        owner1.name = 'Garfield';

        var owner2 = new account.AccountEntity();
        owner2._id = mocker.OperationMocker.getId();
        owner2.name = 'Tom';

        accounts = [owner1, owner2];
    };

    var setupConnections = () => {
        var con1 = new connection.ConnectionEntity();
        con1._id = mocker.OperationMocker.getId();
        con1.accountId = accounts[0]._id;
        con1.accountName = accounts[0].name;
        con1.createdOn = new Date(2005, 1, 25);
        con1.ip = '192.168.0.55';

        var con2 = new connection.ConnectionEntity();
        con2._id = mocker.OperationMocker.getId();
        con2.createdOn = new Date(2005, 1, 24);
        con2.ip = '192.168.0.11';

        var con3 = new connection.ConnectionEntity();
        con3._id = mocker.OperationMocker.getId();
        con3.createdOn = new Date(2005, 1, 27);
        con3.ip = '192.168.0.8';
        con3.accountId = accounts[1]._id;
        con3.accountName = accounts[1].name;

        connections =[con1, con2, con3];
    };
});