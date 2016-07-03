/// <reference path="../../../typings/refs.d.ts" />
import loginOp = require('../../../../../backend/operation/login/loginOperation');
import mocker = require('../../../helper/operationMocker');

describe('Login',() => {
    var req: ILoginRequest;
    var op: loginOp.LoginOperation;
    var mock: mocker.IMockedOperation;

    beforeEach(() => {
        req = {email: 'test@test.com', password: 'password1'};
        op = new loginOp.LoginOperation(req);
        mock = mocker.OperationMocker.mock(op);
    });

    it('returns account id', (done) => {
        var id = mocker.OperationMocker.getId();
        mock.collectionMock.findOne = (doc, cb) => {
            cb(null, {_id: id, roles: [Role.Admin]});
        };

        op.execute((response: loginOp.ILoginAccountResponse) => {
            expect(response.account.id).toEqual(id.toString());
            done();
        });
    });

    it('returns roles', (done) => {
        var id = mocker.OperationMocker.getId();
        mock.collectionMock.findOne = (doc, cb) => {
            cb(null, {_id: id, roles: [Role.Admin]});
        };

        op.execute((response: loginOp.ILoginAccountResponse) => {
            expect(response.account.roles.length).toEqual(1);
            expect(response.account.roles[0]).toEqual(Role.Admin);
            done();
        });
    });

    it('returns error if user and password does not match', (done) => {
        mock.collectionMock.setFindOneToNotFound();

        op.execute((response: loginOp.ILoginAccountResponse) => {
            expect(response.error).toContain('wrong');
            done();
        });
    });

    it('hashes password before checking database', (done) => {
        var hashedPassword: string;
        mock.collectionMock.findOne = (doc, cb) => {
            hashedPassword = doc.password;
            cb(null, null);
        };

        op.execute((response) => {
            expect(hashedPassword).toEqual('69e0baab6da9cca56f065b212b6768e757cb8bd14d1964db130edf41e6782bb7');
            done();
        });
    });
});