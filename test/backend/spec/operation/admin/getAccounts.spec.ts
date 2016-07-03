/// <reference path="../../../typings/refs.d.ts" />
import getAccOp = require('../../../../../backend/operation/admin/getAccountsOperation');
import account = require('../../../../../backend/entities/accountEntity');
import connection = require('../../../../../backend/entities/connectionEntity');
import mocker = require('../../../helper/operationMocker');

describe('Get accounts',() => {
    var req: IGetAccountsRequest;
    var op: getAccOp.GetAccountsOperation;
    var mock: mocker.IMockedOperation;
    var activities;
    var accounts: account.AccountEntity[];

    beforeEach(() => {
        req = {
            filter: 'some account',
            skip: 5,
            take: 10
        };
        op = new getAccOp.GetAccountsOperation(req);
        mock = mocker.OperationMocker.mock(op);
        setupAccounts();
        setupConnections();

        mock.collectionMock.toArray = (cb) => {
            cb(null, accounts);
        };

        mock.collectionMock.aggregate = (pipeline, cb) => {
            cb(null, activities);
        }
    });

    it('returns list of accounts', (done) => {
        op.execute((response: IGetAccountsResponse) => {
            expect(response.error).toBeNull();
            expect(response.list.length).toEqual(2);
            done();
        });
    });

    it('returns account info', (done) => {
        op.execute((response: IGetAccountsResponse) => {
            expect(response.error).toBeNull();
            expect(response.list[0].name).toEqual(accounts[0].name);
            expect(response.list[1].email).toEqual(accounts[1].email);
            done();
        });
    });

    it('fills last activity', (done) => {
        op.execute((response: IGetAccountsResponse) => {
            expect(response.error).toBeNull();
            expect(response.list[0].lastActivityOn).toEqual(activities[0].lastActivityOn);
            expect(response.list[1].lastActivityOn).toEqual(activities[1].lastActivityOn);
            done();
        });
    });

    it('sorts by email', (done) => {
        var sort: any;
        mock.collectionMock.sort = (doc) => {
            sort = doc;
            return mock.collectionMock;
        };

        op.execute((response: IGetAccountsResponse) => {
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

        op.execute((response: IGetAccountsResponse) => {
            expect(response.error).toBeNull();
            expect(take).toEqual(req.take);
            expect(skip).toEqual(req.skip);
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
        op = new getAccOp.GetAccountsOperation(req);
        mock = mocker.OperationMocker.mock(op);
        mock.collectionMock.count = (applySkip, cb) => {
            cb(null, count);
        };

        op.execute((response: IGetAccountsResponse) => {
            expect(response.error).toBeNull();
            expect(response.totalCount).toEqual(count);
            done();
        });
    });

    var setupAccounts = () => {
        var owner1 = new account.AccountEntity();
        owner1._id = mocker.OperationMocker.getId();
        owner1.name = 'Garfield';
        owner1.email = 'garfield@gmail.com';
        owner1.createdOn = new Date(2001, 2, 3);

        var owner2 = new account.AccountEntity();
        owner2._id = mocker.OperationMocker.getId();
        owner2.name = 'Tom';
        owner2.email = 'tom@gmail.com';
        owner2.createdOn = new Date(2012, 5, 11);

        accounts = [owner1, owner2];
    };

    var setupConnections = () => {
        var con1 = {
            _id: accounts[0]._id,
            lastActivityOn: new Date(2011, 1, 27)
        };

        var con2 = {
            _id: accounts[1]._id,
            lastActivityOn: new Date(2013, 3, 4)
        };

        activities = [con1, con2];
    };
});