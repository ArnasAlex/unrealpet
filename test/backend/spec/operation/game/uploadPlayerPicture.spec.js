/// <reference path="../../../typings/refs.d.ts" />
var uploadOp = require('../../../../../backend/operation/game/uploadPlayerPictureOperation');
var mocker = require('../../../helper/operationMocker');
var playerEntity = require('../../../../../backend/entities/playerEntity');
describe('Upload player picture', function () {
    var req;
    var op;
    var mock;
    var spyUpload;
    var spyOptimize;
    var spyRemove;
    var uploadedFileName;
    var player;
    var currentUserId = mocker.OperationMocker.getId().toString();
    beforeEach(function () {
        req = {};
        uploadedFileName = 'playerPicture.png';
        op = new uploadOp.UploadPlayerPictureOperation(req);
        mock = mocker.OperationMocker.mock(op);
        player = new playerEntity.PlayerEntity();
        player.pictureUrl = '/uploads/g/oldPicture.jpeg';
        spyUpload = spyOn(op, 'upload');
        spyUpload.and.callFake(function (next) {
            next(null, uploadedFileName);
        });
        spyOptimize = spyOn(op, 'executeOptimization');
        spyOptimize.and.callFake(function (notOptimizedPath, optimizedPath, resizeFunc, next) {
            next(null, notOptimizedPath, optimizedPath);
        });
        spyRemove = spyOn(op, 'executeRemoveFileOperation');
        spyRemove.and.callFake(function (req, cb) {
            cb({});
        });
        mock.collectionMock.findOne = function (query, cb) {
            cb(null, player);
        };
        mock.collectionMock.save = function (doc, cb) {
            cb(null);
        };
        spyOn(op, 'currentUserId').and.callFake(function () { return currentUserId; });
    });
    it('uploads file to disk', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(spyUpload.calls.count()).toEqual(1);
            done();
        });
    });
    it('optimizes picture', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            var notOptimized = './uploads/g/playerPicture.png';
            var optimized = './uploads/g/playerPicture.jpeg';
            expect(spyOptimize).toHaveBeenCalledWith(notOptimized, optimized, jasmine.any(Function), jasmine.any(Function));
            done();
        });
    });
    it('removes not optimized picture if extension is different', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            var notOptimized = './uploads/g/playerPicture.png';
            expect(spyRemove).toHaveBeenCalledWith({ filePath: notOptimized }, jasmine.any(Function));
            expect(spyRemove.calls.count()).toEqual(2);
            done();
        });
    });
    it('does not remove not optimized picture if extension is same as optimized', function (done) {
        uploadedFileName = 'playerPicture.jpeg';
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(spyRemove.calls.count()).toEqual(1);
            done();
        });
    });
    it('returns picture url', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(response.pictureUrl).toEqual('/uploads/g/playerPicture.jpeg');
            done();
        });
    });
    it('updates player picture if player already exists', function (done) {
        var savingPlayer;
        mock.collectionMock.save = function (doc, cb) {
            savingPlayer = doc;
            cb(null);
        };
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(savingPlayer.pictureUrl).toEqual('/uploads/g/playerPicture.jpeg');
            done();
        });
    });
    it('creates new player with uploaded picture if player does not exists', function (done) {
        mock.collectionMock.findOne = function (doc, cb) {
            cb(null);
        };
        var savingPlayer;
        mock.collectionMock.save = function (doc, cb) {
            savingPlayer = doc;
            cb(null);
        };
        op.execute(function (response) {
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
    it('removes old player picture', function (done) {
        var oldPicture = './uploads/g/oldPicture.jpeg';
        op.execute(function (response) {
            expect(response.error).toBeUndefined();
            expect(spyRemove).toHaveBeenCalledWith({ filePath: oldPicture }, jasmine.any(Function));
            expect(spyRemove.calls.count()).toEqual(2);
            done();
        });
    });
});
//# sourceMappingURL=uploadPlayerPicture.spec.js.map