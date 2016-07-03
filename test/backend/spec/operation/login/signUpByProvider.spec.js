/// <reference path="../../../typings/refs.d.ts" />
var signupOp = require('../../../../../backend/operation/login/signUpByProviderOperation');
var mocker = require('../../../helper/operationMocker');
describe('Sign up by provider', function () {
    var req;
    var op;
    var mock;
    beforeEach(function () {
        var headers = [];
        headers['accept-language'] = 'lt,en-US;q=0.8,en;q=0.6,ru;q=0.4,pl;q=0.2';
        req = {
            provider: 1,
            profile: {
                id: 'someId',
                displayName: 'Cat owner',
                emails: [{ value: 'catowner@emai.com' }]
            },
            req: { headers: headers }
        };
        op = new signupOp.SignUpByProviderOperation(req);
        mock = mocker.OperationMocker.mock(op);
        mock.collectionMock.setFindOneToNotFound();
    });
    it('saves account to database', function (done) {
        var savedDoc;
        mock.collectionMock.save = function (doc, cb) {
            savedDoc = doc;
            doc._id = mocker.OperationMocker.getId();
            cb(null, doc);
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(savedDoc.email).toEqual(req.profile.emails[0].value);
            expect(savedDoc.master.name).toEqual(req.profile.displayName);
            expect(savedDoc.google.id).toEqual(req.profile.id);
            done();
        });
    });
    it('returns account info', function (done) {
        var id = mocker.OperationMocker.getId();
        var savedDoc;
        mock.collectionMock.save = function (doc, cb) {
            savedDoc = doc;
            doc._id = id;
            cb(null, doc);
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.account.id).toEqual(id.toString());
            done();
        });
    });
    it('sets default values to pet', function (done) {
        var savedDoc;
        mock.collectionMock.save = function (doc, cb) {
            savedDoc = doc;
            doc._id = mocker.OperationMocker.getId();
            cb(null, doc);
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(savedDoc.type).toEqual(1);
            expect(savedDoc.name).toContain('UnrealPet');
            done();
        });
    });
    it('saves language according to accept-language header', function (done) {
        var savedDoc;
        mock.collectionMock.save = function (doc, cb) {
            savedDoc = doc;
            doc._id = mocker.OperationMocker.getId();
            cb(null, doc);
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(savedDoc.settings.language).toEqual(2);
            done();
        });
    });
    it('saves account without email', function (done) {
        var headers = [];
        headers['accept-language'] = 'lt,en-US;q=0.8,en;q=0.6,ru;q=0.4,pl;q=0.2';
        req = {
            provider: 1,
            profile: {
                id: 'someId',
                displayName: 'Cat owner'
            },
            req: { headers: headers }
        };
        op = new signupOp.SignUpByProviderOperation(req);
        mock = mocker.OperationMocker.mock(op);
        mock.collectionMock.setFindOneToNotFound();
        var savedDoc;
        mock.collectionMock.save = function (doc, cb) {
            savedDoc = doc;
            doc._id = mocker.OperationMocker.getId();
            cb(null, doc);
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(savedDoc.master.name).toEqual(req.profile.displayName);
            expect(savedDoc.google.id).toEqual(req.profile.id);
            done();
        });
    });
});
//# sourceMappingURL=signUpByProvider.spec.js.map