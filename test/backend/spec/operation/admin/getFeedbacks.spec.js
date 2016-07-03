/// <reference path="../../../typings/refs.d.ts" />
var getFeedbacksOp = require('../../../../../backend/operation/admin/getFeedbacksOperation');
var account = require('../../../../../backend/entities/accountEntity');
var feedback = require('../../../../../backend/entities/feedbackEntity');
var mocker = require('../../../helper/operationMocker');
describe('Get feedbacks', function () {
    var req;
    var op;
    var mock;
    var feedbacks;
    var accounts;
    beforeEach(function () {
        req = {
            filter: 'some feedback',
            skip: 5,
            take: 10
        };
        op = new getFeedbacksOp.GetFeedbacksOperation(req);
        mock = mocker.OperationMocker.mock(op);
        setupAccounts();
        setupFeedbacks();
        mock.collectionMock.toArray = function (cb) {
            var result = mock.collectionMock.name === feedback.CollectionName ? feedbacks : accounts;
            cb(null, result);
        };
    });
    it('returns list of feedbacks', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.list.length).toEqual(2);
            done();
        });
    });
    it('returns feedback info', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.list[0].message).toEqual('Very good');
            expect(response.list[0].isHappy).toEqual(true);
            done();
        });
    });
    it('sorts by creation date', function (done) {
        var sort;
        mock.collectionMock.sort = function (doc) {
            sort = doc;
            return mock.collectionMock;
        };
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(sort.createdOn).toEqual(-1);
            done();
        });
    });
    it('fills account name', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.list[0].name).toEqual(accounts[0].name);
            done();
        });
    });
    var setupAccounts = function () {
        var owner1 = new account.AccountEntity();
        owner1._id = mocker.OperationMocker.getId();
        owner1.name = 'Garfield';
        var owner2 = new account.AccountEntity();
        owner2._id = mocker.OperationMocker.getId();
        owner2.name = 'Tom';
        accounts = [owner1, owner2];
    };
    var setupFeedbacks = function () {
        var feed1 = new feedback.FeedbackEntity();
        feed1._id = mocker.OperationMocker.getId();
        feed1.accountId = accounts[0]._id;
        feed1.ip = '127.5.4.1';
        feed1.isHappy = true;
        feed1.message = 'Very good';
        feed1.createdOn = new Date(2005, 1, 25);
        var feed2 = new feedback.FeedbackEntity();
        feed2._id = mocker.OperationMocker.getId();
        feed2.accountId = accounts[1]._id;
        feed2.ip = '127.1.1.1';
        feed2.isHappy = false;
        feed2.message = 'No understand';
        feed2.createdOn = new Date(2005, 1, 27);
        feedbacks = [feed1, feed2];
    };
});
//# sourceMappingURL=getFeedbacks.spec.js.map