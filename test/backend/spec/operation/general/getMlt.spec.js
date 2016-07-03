/// <reference path="../../../typings/refs.d.ts" />
var getMltOp = require('../../../../../backend/operation/general/getMltOperation');
var mocker = require('../../../helper/operationMocker');
describe('Get multilanguage', function () {
    var req;
    var op;
    beforeEach(function () {
    });
    it('returns english translations for anonymous user with english browser', function (done) {
        var headers = [];
        headers['accept-language'] = 'en-US,lt;q=0.8,en;q=0.6,ru;q=0.4,pl;q=0.2';
        req = { headers: headers, query: {} };
        op = new getMltOp.GetMltOperation(req);
        op.execute(function (response) {
            expect(response.language).toEqual(1);
            expect(response.mlt.control_cancel).toEqual('Cancel');
            done();
        });
    });
    it('returns english translations for anonymous user with lithuanian browser', function (done) {
        var headers = [];
        headers['accept-language'] = 'lt,en-US;q=0.8,en;q=0.6,ru;q=0.4,pl;q=0.2';
        req = { headers: headers, query: {} };
        op = new getMltOp.GetMltOperation(req);
        op.execute(function (response) {
            expect(response.language).toEqual(2);
            expect(response.mlt.control_ok).toEqual('Gerai');
            done();
        });
    });
    it('returns english translations for authenticated user that has english assigned in account settings', function (done) {
        var headers = [];
        headers['accept-language'] = 'lt,en-US;q=0.8,en;q=0.6,ru;q=0.4,pl;q=0.2';
        req = {
            headers: headers,
            user: { id: mocker.OperationMocker.getId().toString() },
            query: { preferredLanguage: (2).toString() }
        };
        op = new getMltOp.GetMltOperation(req);
        var mock = mocker.OperationMocker.mock(op);
        mock.collectionMock.findOne = function (doc, cb) {
            cb(null, { settings: { language: 1 } });
        };
        op.execute(function (response) {
            expect(response.language).toEqual(1);
            expect(response.mlt.control_cancel).toEqual('Cancel');
            done();
        });
    });
    it('returns lithuanian translation for anonymous user with preferred language', function (done) {
        var headers = [];
        headers['accept-language'] = 'en-US,lt;q=0.8,en;q=0.6,ru;q=0.4,pl;q=0.2';
        req = {
            headers: headers,
            query: { preferredLanguage: (2).toString() }
        };
        op = new getMltOp.GetMltOperation(req);
        op.execute(function (response) {
            expect(response.language).toEqual(2);
            expect(response.mlt.control_ok).toEqual('Gerai');
            done();
        });
    });
});
//# sourceMappingURL=getMlt.spec.js.map