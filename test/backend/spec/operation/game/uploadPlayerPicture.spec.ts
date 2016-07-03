/// <reference path="../../../typings/refs.d.ts" />
import uploadOp = require('../../../../../backend/operation/game/uploadPlayerPictureOperation');
import mocker = require('../../../helper/operationMocker');
import playerEntity = require('../../../../../backend/entities/playerEntity');

describe('Upload player picture',() => {
    var req: IUploadPlayerPictureRequest;
    var op: uploadOp.UploadPlayerPictureOperation;
    var mock: mocker.IMockedOperation;
    var spyUpload: jasmine.Spy;
    var spyOptimize: jasmine.Spy;
    var spyRemove: jasmine.Spy;
    var uploadedFileName: string;
    var player: playerEntity.PlayerEntity;
    var currentUserId = mocker.OperationMocker.getId().toString();

    beforeEach(() => {
        req = {};
        uploadedFileName = 'playerPicture.png';
        op = new uploadOp.UploadPlayerPictureOperation(req);
        mock = mocker.OperationMocker.mock(op);
        player = new playerEntity.PlayerEntity();
        player.pictureUrl = '/uploads/g/oldPicture.jpeg';

        spyUpload = spyOn(op, 'upload');
        spyUpload.and.callFake((next) => {
            next(null, uploadedFileName);
        });

        spyOptimize = spyOn(op, 'executeOptimization');
        spyOptimize.and.callFake((notOptimizedPath, optimizedPath, resizeFunc, next) => {
            next(null, notOptimizedPath, optimizedPath);
        });

        spyRemove = spyOn(op, 'executeRemoveFileOperation');
        spyRemove.and.callFake((req, cb) => {
            cb({});
        });

        mock.collectionMock.findOne = (query, cb) => {
            cb(null, player);
        };

        mock.collectionMock.save = (doc, cb) => {
            cb(null);
        };
        spyOn(op, 'currentUserId').and.callFake(() => {return currentUserId});
    });

    it('uploads file to disk', (done) => {
        op.execute((response: IUploadPlayerPictureResponse) => {
            expect(response.error).toBeUndefined();
            expect(spyUpload.calls.count()).toEqual(1);
            done();
        });
    });

    it('optimizes picture', (done) => {
        op.execute((response: IUploadAccountPictureResponse) => {
            expect(response.error).toBeUndefined();
            var notOptimized = './uploads/g/playerPicture.png';
            var optimized = './uploads/g/playerPicture.jpeg';
            expect(spyOptimize).toHaveBeenCalledWith(notOptimized, optimized, jasmine.any(Function), jasmine.any(Function));
            done();
        });
    });

    it('removes not optimized picture if extension is different', (done) => {
        op.execute((response: IUploadAccountPictureResponse) => {
            expect(response.error).toBeUndefined();
            var notOptimized = './uploads/g/playerPicture.png';
            expect(spyRemove).toHaveBeenCalledWith({filePath: notOptimized}, jasmine.any(Function));
            expect(spyRemove.calls.count()).toEqual(2);
            done();
        });
    });

    it('does not remove not optimized picture if extension is same as optimized', (done) => {
        uploadedFileName = 'playerPicture.jpeg';
        op.execute((response: IUploadAccountPictureResponse) => {
            expect(response.error).toBeUndefined();
            expect(spyRemove.calls.count()).toEqual(1);
            done();
        });
    });

    it('returns picture url', (done) => {
        op.execute((response: IUploadAccountPictureResponse) => {
            expect(response.error).toBeUndefined();
            expect(response.pictureUrl).toEqual('/uploads/g/playerPicture.jpeg');
            done();
        });
    });

    it('updates player picture if player already exists', (done) => {
        var savingPlayer: playerEntity.PlayerEntity;
        mock.collectionMock.save = (doc, cb) => {
            savingPlayer = doc;
            cb(null);
        };

        op.execute((response: IUploadAccountPictureResponse) => {
            expect(response.error).toBeUndefined();
            expect(savingPlayer.pictureUrl).toEqual('/uploads/g/playerPicture.jpeg');
            done();
        });
    });

    it('creates new player with uploaded picture if player does not exists', (done) => {
        mock.collectionMock.findOne = (doc, cb) => {
            cb(null);
        };

        var savingPlayer: playerEntity.PlayerEntity;
        mock.collectionMock.save = (doc, cb) => {
            savingPlayer = doc;
            cb(null);
        };

        op.execute((response: IUploadAccountPictureResponse) => {
            expect(response.error).toBeUndefined();
            expect(savingPlayer.pictureUrl).toEqual('/uploads/g/playerPicture.jpeg');
            expect(savingPlayer.accountId.toString()).toEqual(currentUserId);
            expect(savingPlayer.points).toEqual(0);
            expect(savingPlayer.fights).toEqual(0);
            expect(savingPlayer.win).toEqual(0);
            expect(savingPlayer.defeat).toEqual(0);
            done();
        });
    });

    it('removes old player picture', (done) => {
        var oldPicture = './uploads/g/oldPicture.jpeg';
        op.execute((response: IUploadAccountPictureResponse) => {
            expect(response.error).toBeUndefined();
            expect(spyRemove).toHaveBeenCalledWith({filePath: oldPicture}, jasmine.any(Function));
            expect(spyRemove.calls.count()).toEqual(2);
            done();
        });
    });
});