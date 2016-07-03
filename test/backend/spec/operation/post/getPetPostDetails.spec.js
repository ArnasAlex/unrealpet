/// <reference path="../../../typings/refs.d.ts" />
var getPetDetails = require('../../../../../backend/operation/post/getPetPostDetailsOperation');
var mocker = require('../../../helper/operationMocker');
var accountEntity = require('../../../../../backend/entities/accountEntity');
var playerEntity = require('../../../../../backend/entities/playerEntity');
describe('Get pet post details', function () {
    var req;
    var op;
    var mock;
    var account;
    var postCount = 4;
    var player;
    beforeEach(function () {
        req = { id: mocker.OperationMocker.getId().toString() };
        op = new getPetDetails.GetPetPostDetailsOperation(req);
        player = new playerEntity.PlayerEntity();
        player.pictureUrl = '/uploads/g/pic.jpeg';
        setMocks();
        account = new accountEntity.AccountEntity();
        account._id = mocker.OperationMocker.getObjectId(req.id);
        account.name = 'Garfield';
    });
    var setMocks = function () {
        mock = mocker.OperationMocker.mock(op);
        mock.collectionMock.findOne = function (query, cb) {
            var result = mock.collectionMock.name === accountEntity.CollectionName
                ? account
                : player;
            cb(null, result);
        };
        mock.collectionMock.count = function (query, cb) {
            cb(null, postCount);
        };
        var callCount = 0;
        mock.collectionMock.aggregate = function (pipeline, cb) {
            callCount++;
            cb(null, [{ count: callCount }]);
        };
    };
    it('fills account details', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.details.name).toEqual(account.name);
            done();
        });
    });
    it('fills post count', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.details.posts).toEqual(postCount);
            done();
        });
    });
    it('fills comment count', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.details.comments).toEqual(1);
            done();
        });
    });
    it('fills paw count', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.details.paws).toEqual(2);
            done();
        });
    });
    it('fills UPP count', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.details.upps).toEqual(3);
            done();
        });
    });
    it('fills game picture if player is found', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.details.gamePictureUrl).toEqual('/uploads/g/pic.jpeg');
            done();
        });
    });
    it('does not fill game picture if pet is not playing the game', function (done) {
        player = null;
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.details.gamePictureUrl).toBeUndefined();
            done();
        });
    });
    it('returns current authenticated user pet details if id is not defined in request', function (done) {
        req = { accountId: mocker.OperationMocker.getId().toString() };
        op = new getPetDetails.GetPetPostDetailsOperation(req);
        setMocks();
        spyOn(mock.collectionMock, 'findOne').and.callThrough();
        op.execute(function (response) {
            expect(response.error).toBeNull();
            var accId = mocker.OperationMocker.getObjectId(req.accountId);
            expect(mock.collectionMock.findOne).toHaveBeenCalledWith({ _id: accId }, jasmine.any(Function));
            done();
        });
    });
    it('returns pet details by id', function (done) {
        spyOn(mock.collectionMock, 'findOne').and.callThrough();
        op.execute(function (response) {
            expect(response.error).toBeNull();
            var accId = mocker.OperationMocker.getObjectId(req.id);
            expect(mock.collectionMock.findOne).toHaveBeenCalledWith({ _id: accId }, jasmine.any(Function));
            done();
        });
    });
    it('returns error code if user was not found', function (done) {
        spyOn(mock.collectionMock, 'findOne').and.callFake(function (query, cb) {
            cb(null, null);
        });
        op.execute(function (response) {
            expect(response.error).toEqual(2);
            done();
        });
    });
    it('returns error code if id is not provided for unauthenticated user', function (done) {
        req = {};
        op = new getPetDetails.GetPetPostDetailsOperation(req);
        setMocks();
        op.execute(function (response) {
            expect(response.error).toEqual(2);
            done();
        });
    });
});
//# sourceMappingURL=getPetPostDetails.spec.js.map