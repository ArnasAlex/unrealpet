/// <reference path="../../../typings/refs.d.ts" />
import getPetDetails = require('../../../../../backend/operation/post/getPetPostDetailsOperation');
import post = require('../../../../../backend/entities/postEntity');
import mocker = require('../../../helper/operationMocker');
import accountEntity = require('../../../../../backend/entities/accountEntity');
import playerEntity = require('../../../../../backend/entities/playerEntity');

describe('Get pet post details',() => {
    var req: IGetPetPostDetailsRequest;
    var op: getPetDetails.GetPetPostDetailsOperation;
    var mock: mocker.IMockedOperation;
    var account: accountEntity.AccountEntity;
    var postCount = 4;
    var player: playerEntity.PlayerEntity;

    beforeEach(() => {
        req = { id: mocker.OperationMocker.getId().toString() };
        op = new getPetDetails.GetPetPostDetailsOperation(req);
        player = new playerEntity.PlayerEntity();
        player.pictureUrl = '/uploads/g/pic.jpeg';

        setMocks();

        account = new accountEntity.AccountEntity();
        account._id = mocker.OperationMocker.getObjectId(req.id);
        account.name = 'Garfield';
    });

    var setMocks = () => {
        mock = mocker.OperationMocker.mock(op);
        mock.collectionMock.findOne = (query, cb) => {
            var result = mock.collectionMock.name === accountEntity.CollectionName
                ? account
                : player;
            cb(null, result);
        };

        mock.collectionMock.count = (query, cb) => {
            cb(null, postCount);
        };

        var callCount = 0;
        mock.collectionMock.aggregate = (pipeline, cb) => {
            callCount++;
            cb(null, [{count: callCount}]);
        };
    };

    it('fills account details', (done) => {
        op.execute((response: IGetPetPostDetailsResponse) => {
            expect(response.error).toBeNull();
            expect(response.details.name).toEqual(account.name);
            done();
        });
    });

    it('fills post count', (done) => {
        op.execute((response: IGetPetPostDetailsResponse) => {
            expect(response.error).toBeNull();
            expect(response.details.posts).toEqual(postCount);
            done();
        });
    });

    it('fills comment count', (done) => {
        op.execute((response: IGetPetPostDetailsResponse) => {
            expect(response.error).toBeNull();
            expect(response.details.comments).toEqual(1);
            done();
        });
    });

    it('fills paw count', (done) => {
        op.execute((response: IGetPetPostDetailsResponse) => {
            expect(response.error).toBeNull();
            expect(response.details.paws).toEqual(2);
            done();
        });
    });

    it('fills UPP count', (done) => {
        op.execute((response: IGetPetPostDetailsResponse) => {
            expect(response.error).toBeNull();
            expect(response.details.upps).toEqual(3);
            done();
        });
    });

    it('fills game picture if player is found', (done) => {
        op.execute((response: IGetPetPostDetailsResponse) => {
            expect(response.error).toBeNull();
            expect(response.details.gamePictureUrl).toEqual('/uploads/g/pic.jpeg');
            done();
        });
    });

    it('does not fill game picture if pet is not playing the game', (done) => {
        player = null;
        op.execute((response: IGetPetPostDetailsResponse) => {
            expect(response.error).toBeNull();
            expect(response.details.gamePictureUrl).toBeUndefined();
            done();
        });
    });

    it('returns current authenticated user pet details if id is not defined in request', (done) => {
        req = { accountId: mocker.OperationMocker.getId().toString() };
        op = new getPetDetails.GetPetPostDetailsOperation(req);
        setMocks();

        spyOn(mock.collectionMock, 'findOne').and.callThrough();
        op.execute((response: IGetPetPostDetailsResponse) => {
            expect(response.error).toBeNull();
            var accId = mocker.OperationMocker.getObjectId(req.accountId);
            expect(mock.collectionMock.findOne).toHaveBeenCalledWith({_id: accId}, jasmine.any(Function));
            done();
        });
    });

    it('returns pet details by id', (done) => {
        spyOn(mock.collectionMock, 'findOne').and.callThrough();
        op.execute((response: IGetPetPostDetailsResponse) => {
            expect(response.error).toBeNull();
            var accId = mocker.OperationMocker.getObjectId(req.id);
            expect(mock.collectionMock.findOne).toHaveBeenCalledWith({_id: accId}, jasmine.any(Function));
            done();
        });
    });

    it('returns error code if user was not found', (done) => {
        spyOn(mock.collectionMock, 'findOne').and.callFake((query, cb) => {
            cb(null, null);
        });
        op.execute((response: IGetPetPostDetailsResponse) => {
            expect(response.error).toEqual(ErrorCodes.NotFound);
            done();
        });
    });

    it('returns error code if id is not provided for unauthenticated user', (done) => {
        req = { };
        op = new getPetDetails.GetPetPostDetailsOperation(req);
        setMocks();

        op.execute((response: IGetPetPostDetailsResponse) => {
            expect(response.error).toEqual(ErrorCodes.NotFound);
            done();
        });
    });
});