/// <reference path="../../../typings/refs.d.ts" />
import getMltOp = require('../../../../../backend/operation/general/getMltOperation');
import mocker = require('../../../helper/operationMocker');

describe('Get multilanguage',() => {
    var req;
    var op: getMltOp.GetMltOperation;

    beforeEach(() => {
    });

    it('returns english translations for anonymous user with english browser', (done) => {
        var headers = [];
        headers['accept-language'] = 'en-US,lt;q=0.8,en;q=0.6,ru;q=0.4,pl;q=0.2';
        req = {headers: headers, query: {}};
        op = new getMltOp.GetMltOperation(req);

        op.execute((response: IGetMltResponse) => {
            expect(response.language).toEqual(Language.English);
            expect(response.mlt.control_cancel).toEqual('Cancel');
            done();
        });
    });

    it('returns english translations for anonymous user with lithuanian browser', (done) => {
        var headers = [];
        headers['accept-language'] = 'lt,en-US;q=0.8,en;q=0.6,ru;q=0.4,pl;q=0.2';
        req = {headers: headers, query: {}};
        op = new getMltOp.GetMltOperation(req);

        op.execute((response: IGetMltResponse) => {
            expect(response.language).toEqual(Language.Lithuanian);
            expect(response.mlt.control_ok).toEqual('Gerai');
            done();
        });
    });

    it('returns english translations for authenticated user that has english assigned in account settings', (done) => {
        var headers = [];
        headers['accept-language'] = 'lt,en-US;q=0.8,en;q=0.6,ru;q=0.4,pl;q=0.2';
        req = {
            headers: headers,
            user: {id: mocker.OperationMocker.getId().toString()},
            query: {preferredLanguage: (Language.Lithuanian).toString() }
        };

        op = new getMltOp.GetMltOperation(req);
        var mock = mocker.OperationMocker.mock(op);

        mock.collectionMock.findOne = (doc, cb) => {
            cb(null, {settings: {language: Language.English}});
        };

        op.execute((response: IGetMltResponse) => {
            expect(response.language).toEqual(Language.English);
            expect(response.mlt.control_cancel).toEqual('Cancel');
            done();
        });
    });

    it('returns lithuanian translation for anonymous user with preferred language', (done) => {
        var headers = [];
        headers['accept-language'] = 'en-US,lt;q=0.8,en;q=0.6,ru;q=0.4,pl;q=0.2';

        req = {
            headers: headers,
            query: {preferredLanguage: (Language.Lithuanian).toString() }
        };
        op = new getMltOp.GetMltOperation(req);

        op.execute((response: IGetMltResponse) => {
            expect(response.language).toEqual(Language.Lithuanian);
            expect(response.mlt.control_ok).toEqual('Gerai');
            done();
        });
    });
});