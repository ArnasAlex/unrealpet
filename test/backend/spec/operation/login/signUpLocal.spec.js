/// <reference path="../../../typings/refs.d.ts" />
var signupOp = require('../../../../../backend/operation/login/signUpLocalOperation');
var mocker = require('../../../helper/operationMocker');
describe('Sign up local', function () {
    var req;
    var op;
    var mock;
    beforeEach(function () {
        var headers = [];
        headers['accept-language'] = 'lt,en-US;q=0.8,en;q=0.6,ru;q=0.4,pl;q=0.2';
        req = {
            email: 'test@test.com',
            password: 'password1',
            req: { headers: headers }
        };
        op = new signupOp.SignUpLocalOperation(req);
        mock = mocker.OperationMocker.mock(op);
    });
    it('saves account to database', function (done) {
        mock.collectionMock.setFindOneToNotFound();
        var saveCalled = false;
        mock.collectionMock.save = function (doc, cb) {
            saveCalled = true;
            cb(null);
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(saveCalled).toBeTruthy();
            done();
        });
    });
    it('returns error if email already exists', function (done) {
        op.execute(function (response) {
            expect(response.error).toContain('exists');
            done();
        });
    });
    it('hashes password before checking database', function (done) {
        mock.collectionMock.setFindOneToNotFound();
        var hashedPassword;
        mock.collectionMock.save = function (doc, cb) {
            hashedPassword = doc.password;
            cb(null, null);
        };
        op.execute(function (response) {
            expect(hashedPassword).toEqual('69e0baab6da9cca56f065b212b6768e757cb8bd14d1964db130edf41e6782bb7');
            done();
        });
    });
    it('sets default values for pet', function (done) {
        mock.collectionMock.setFindOneToNotFound();
        var savedDoc;
        mock.collectionMock.save = function (doc, cb) {
            savedDoc = doc;
            cb(null);
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(savedDoc.type).toEqual(1);
            expect(savedDoc.name).toContain('UnrealPet');
            done();
        });
    });
    it('saves language according to accept-language header', function (done) {
        mock.collectionMock.setFindOneToNotFound();
        var savedDoc;
        mock.collectionMock.save = function (doc, cb) {
            savedDoc = doc;
            cb(null);
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(savedDoc.settings.language).toEqual(2);
            done();
        });
    });
});
//# sourceMappingURL=signUpLocal.spec.js.map