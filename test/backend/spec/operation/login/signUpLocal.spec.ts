/// <reference path="../../../typings/refs.d.ts" />
import signupOp = require('../../../../../backend/operation/login/signUpLocalOperation');
import mocker = require('../../../helper/operationMocker');
import accEntity = require('../../../../../backend/entities/accountEntity');

describe('Sign up local',() => {
    var req: signupOp.ISignUpLocalRequest;
    var op: signupOp.SignUpLocalOperation;
    var mock: mocker.IMockedOperation;

    beforeEach(() => {
        var headers = [];
        headers['accept-language'] = 'lt,en-US;q=0.8,en;q=0.6,ru;q=0.4,pl;q=0.2';

        req = {
            email: 'test@test.com',
            password: 'password1',
            req: <any>{headers: headers}
        };
        op = new signupOp.SignUpLocalOperation(req);
        mock = mocker.OperationMocker.mock(op);
    });

    it('saves account to database', (done) => {
        mock.collectionMock.setFindOneToNotFound();

        var saveCalled = false;
        mock.collectionMock.save = (doc, cb) => {
            saveCalled = true;
            cb(null);
        };

        op.execute((response: ISignUpResponse) => {
            expect(response.error).toBeNull();
            expect(saveCalled).toBeTruthy();
            done();
        });
    });

    it('returns error if email already exists', (done) => {
        op.execute((response: ILoginResponse) => {
            expect(response.error).toContain('exists');
            done();
        });
    });

    it('hashes password before checking database', (done) => {
        mock.collectionMock.setFindOneToNotFound();

        var hashedPassword: string;
        mock.collectionMock.save = (doc, cb) => {
            hashedPassword = doc.password;
            cb(null, null);
        };

        op.execute((response) => {
            expect(hashedPassword).toEqual('69e0baab6da9cca56f065b212b6768e757cb8bd14d1964db130edf41e6782bb7');
            done();
        });
    });

    it('sets default values for pet', (done) => {
        mock.collectionMock.setFindOneToNotFound();

        var savedDoc: accEntity.AccountEntity;
        mock.collectionMock.save = (doc, cb) => {
            savedDoc = doc;
            cb(null);
        };

        op.execute((response: ISignUpResponse) => {
            expect(response.error).toBeNull();
            expect(savedDoc.type).toEqual(PetType.Other);
            expect(savedDoc.name).toContain('UnrealPet');
            done();
        });
    });

    it('saves language according to accept-language header', (done) => {
        mock.collectionMock.setFindOneToNotFound();

        var savedDoc: accEntity.AccountEntity;
        mock.collectionMock.save = (doc, cb) => {
            savedDoc = doc;
            cb(null);
        };

        op.execute((response: ISignUpResponse) => {
            expect(response.error).toBeNull();
            expect(savedDoc.settings.language).toEqual(Language.Lithuanian);
            done();
        });
    });
});