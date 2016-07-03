/// <reference path="../../../typings/refs.d.ts" />
import signupOp = require('../../../../../backend/operation/login/signUpByProviderOperation');
import mocker = require('../../../helper/operationMocker');
import accEntity = require('../../../../../backend/entities/accountEntity');

describe('Sign up by provider',() => {
    var req: signupOp.ISignUpByProviderRequest;
    var op: signupOp.SignUpByProviderOperation;
    var mock: mocker.IMockedOperation;

    beforeEach(() => {
        var headers = [];
        headers['accept-language'] = 'lt,en-US;q=0.8,en;q=0.6,ru;q=0.4,pl;q=0.2';
        req = {
            provider: LoginProvider.Google,
            profile: {
                id: 'someId',
                displayName: 'Cat owner',
                emails: [{value: 'catowner@emai.com'}]
            },
            req: <any>{headers: headers}
        };
        op = new signupOp.SignUpByProviderOperation(req);
        mock = mocker.OperationMocker.mock(op);
        mock.collectionMock.setFindOneToNotFound();
    });

    it('saves account to database', (done) => {
        var savedDoc: accEntity.AccountEntity;
        mock.collectionMock.save = (doc, cb) => {
            savedDoc = doc;
            doc._id = mocker.OperationMocker.getId();
            cb(null, doc);
        };

        op.execute((response: signupOp.ISignUpByProviderResponse) => {
            expect(response.error).toBeNull();
            expect(savedDoc.email).toEqual(req.profile.emails[0].value);
            expect(savedDoc.master.name).toEqual(req.profile.displayName);
            expect(savedDoc.google.id).toEqual(req.profile.id);
            done();
        });
    });

    it('returns account info', (done) => {
        var id = mocker.OperationMocker.getId();
        var savedDoc: accEntity.AccountEntity;
        mock.collectionMock.save = (doc, cb) => {
            savedDoc = doc;
            doc._id = id;
            cb(null, doc);
        };

        op.execute((response: signupOp.ISignUpByProviderResponse) => {
            expect(response.error).toBeNull();
            expect(response.account.id).toEqual(id.toString());
            done();
        });
    });

    it('sets default values to pet', (done) => {
        var savedDoc: accEntity.AccountEntity;
        mock.collectionMock.save = (doc, cb) => {
            savedDoc = doc;
            doc._id = mocker.OperationMocker.getId();
            cb(null, doc);
        };

        op.execute((response: signupOp.ISignUpByProviderResponse) => {
            expect(response.error).toBeNull();
            expect(savedDoc.type).toEqual(PetType.Other);
            expect(savedDoc.name).toContain('UnrealPet');
            done();
        });
    });

    it('saves language according to accept-language header', (done) => {
        var savedDoc: accEntity.AccountEntity;
        mock.collectionMock.save = (doc, cb) => {
            savedDoc = doc;
            doc._id = mocker.OperationMocker.getId();
            cb(null, doc);
        };

        op.execute((response: signupOp.ISignUpByProviderResponse) => {
            expect(response.error).toBeNull();
            expect(savedDoc.settings.language).toEqual(Language.Lithuanian);
            done();
        });
    });

    it('saves account without email', (done) => {
        var headers = [];
        headers['accept-language'] = 'lt,en-US;q=0.8,en;q=0.6,ru;q=0.4,pl;q=0.2';
        req = <any>{
            provider: LoginProvider.Google,
            profile: {
                id: 'someId',
                displayName: 'Cat owner'
            },
            req: <any>{headers: headers}
        };
        op = new signupOp.SignUpByProviderOperation(req);
        mock = mocker.OperationMocker.mock(op);
        mock.collectionMock.setFindOneToNotFound();

        var savedDoc: accEntity.AccountEntity;
        mock.collectionMock.save = (doc, cb) => {
            savedDoc = doc;
            doc._id = mocker.OperationMocker.getId();
            cb(null, doc);
        };

        op.execute((response: signupOp.ISignUpByProviderResponse) => {
            expect(response.error).toBeNull();
            expect(savedDoc.master.name).toEqual(req.profile.displayName);
            expect(savedDoc.google.id).toEqual(req.profile.id);
            done();
        });
    });

});