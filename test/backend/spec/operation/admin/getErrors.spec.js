/// <reference path="../../../typings/refs.d.ts" />
var getErrOp = require('../../../../../backend/operation/admin/getErrorsOperation');
var errorEntity = require('../../../../../backend/entities/errorLogEntity');
var mocker = require('../../../helper/operationMocker');
describe('Get connections', function () {
    var req;
    var op;
    var mock;
    var errors;
    beforeEach(function () {
        req = {
            filter: 'some message',
            skip: 5,
            take: 10
        };
        op = new getErrOp.GetErrorsOperation(req);
        mock = mocker.OperationMocker.mock(op);
        setupErrors();
        mock.collectionMock.toArray = function (cb) {
            cb(null, errors);
        };
    });
    it('returns list of errors', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.list.length).toEqual(2);
            done();
        });
    });
    it('returns error info', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.list[0].date).toEqual(errors[0].createdOn);
            expect(response.list[0].message).toEqual(errors[0].message);
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
            expect(response.error).toBeNull();
            expect(sort.createdOn).toEqual(-1);
            done();
        });
    });
    it('has paging', function (done) {
        var skip = 0;
        var take = 0;
        mock.collectionMock.limit = function (count) {
            take = count;
            return mock.collectionMock;
        };
        mock.collectionMock.skip = function (count) {
            skip = count;
            return mock.collectionMock;
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(take).toEqual(req.take);
            expect(skip).toEqual(req.skip);
            done();
        });
    });
    it('filters message', function (done) {
        var filter;
        mock.collectionMock.find = function (doc) {
            filter = doc;
            return this;
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(filter.message).toEqual(/some message/i);
            done();
        });
    });
    it('returns total count for first page', function (done) {
        var count = 5;
        req = {
            filter: 'some action',
            skip: 0,
            take: 10
        };
        op = new getErrOp.GetErrorsOperation(req);
        mock = mocker.OperationMocker.mock(op);
        mock.collectionMock.count = function (applySkip, cb) {
            cb(null, count);
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.totalCount).toEqual(count);
            done();
        });
    });
    var setupErrors = function () {
        var err1 = new errorEntity.ErrorLogEntity();
        err1._id = mocker.OperationMocker.getId();
        err1.message = 'some critical err occured';
        err1.type = 3;
        err1.createdOn = new Date(2005, 1, 20);
        var err2 = new errorEntity.ErrorLogEntity();
        err2._id = mocker.OperationMocker.getId();
        err2.message = 'some warrning occured';
        err2.type = 1;
        err2.createdOn = new Date(2005, 1, 25);
        errors = [err1, err2];
    };
});
//# sourceMappingURL=getErrors.spec.js.map