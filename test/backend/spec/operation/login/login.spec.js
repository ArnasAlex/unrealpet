/// <reference path="../../../typings/refs.d.ts" />
var loginOp = require('../../../../../backend/operation/login/loginOperation');
var mocker = require('../../../helper/operationMocker');
describe('Login', function () {
    var req;
    var op;
    var mock;
    beforeEach(function () {
        req = { email: 'test@test.com', password: 'password1' };
        op = new loginOp.LoginOperation(req);
        mock = mocker.OperationMocker.mock(op);
    });
    it('returns account id', function (done) {
        var id = mocker.OperationMocker.getId();
        mock.collectionMock.findOne = function (doc, cb) {
            cb(null, { _id: id, roles: [2] });
        };
        op.execute(function (response) {
            expect(response.account.id).toEqual(id.toString());
            done();
        });
    });
    it('returns roles', function (done) {
        var id = mocker.OperationMocker.getId();
        mock.collectionMock.findOne = function (doc, cb) {
            cb(null, { _id: id, roles: [2] });
        };
        op.execute(function (response) {
            expect(response.account.roles.length).toEqual(1);
            expect(response.account.roles[0]).toEqual(2);
            done();
        });
    });
    it('returns error if user and password does not match', function (done) {
        mock.collectionMock.setFindOneToNotFound();
        op.execute(function (response) {
            expect(response.error).toContain('wrong');
            done();
        });
    });
    it('hashes password before checking database', function (done) {
        var hashedPassword;
        mock.collectionMock.findOne = function (doc, cb) {
            hashedPassword = doc.password;
            cb(null, null);
        };
        op.execute(function (response) {
            expect(hashedPassword).toEqual('69e0baab6da9cca56f065b212b6768e757cb8bd14d1964db130edf41e6782bb7');
            done();
        });
    });
});
//# sourceMappingURL=login.spec.js.map