/// <reference path="../../../typings/refs.d.ts" />
import fileCleanupOp = require('../../../../../backend/operation/job/fileCleanupOperation');
import mocker = require('../../../helper/operationMocker');
import constants = require('../../../../../backend/core/constants');
import postEntity = require('../../../../../backend/entities/postEntity');
import accountEntity = require('../../../../../backend/entities/accountEntity');
import _ = require('lodash');

describe('File cleanup',() => {
    var req: fileCleanupOp.IFileCleanupRequest;
    var op: fileCleanupOp.FileCleanupOpration;
    var mock: mocker.IMockedOperation;
    var spyFsReadDir: jasmine.Spy;
    var spyFsStat: jasmine.Spy;
    var spyFsUnlink: jasmine.Spy;
    var spyDbToArray: jasmine.Spy;
    var spyLogError: jasmine.Spy;

    beforeEach(() => {
        req = {};
        op = new fileCleanupOp.FileCleanupOpration(req);
        mock = mocker.OperationMocker.mock(op);
        setupSpyDatabase();
        setupSpies();
    });

    var setupSpyDatabase = () => {
        spyDbToArray = spyOn(mock.collectionMock, 'toArray');
        spyDbToArray.and.callFake((cb) => {
            var accounts = [
                {logo: '/uploads/pictures/logo.jpg', picture: '/uploads/pictures/sodfasdfa.jpeg'},
                {logo: '/uploads/pictures/logo333.jpg', picture: '/uploads/pictures/sodsfasdfa.jpeg'}
            ];

            var posts = [{pictureUrl: '/uploads/videos/vid2.avi'}, {pictureUrl: '/uploads/pictures/somePic2.jpg'}];
            var result = mock.collectionMock.name === accountEntity.CollectionName
                ? accounts
                : posts;

            cb(null, result);
        });
    };

    var setupSpies = () => {
        spyFsReadDir = spyOn(op, 'fsReadDir');
        spyFsReadDir.and.callFake((dir, cb) => {
            var pictures = ['somePic1.png', 'somePic2.jpg', 'somePic3.jpg', 'logo.jpg'];
            var videos = ['vid1.mp4', 'vid2.avi', 'vid3.avi'];
            var result = dir.indexOf('picture') !== -1 ? pictures : videos;
            cb(null, result);
        });

        spyFsStat = spyOn(op, 'fsStat');
        spyFsStat.and.callFake((file, cb) => {
            var creationDate = file.indexOf('1') === -1 ? new Date(2004) : new Date();
            cb(null, {file: file, stat: {ctime: creationDate}});
        });

        spyFsUnlink = spyOn(op, 'fsUnlink');
        spyFsUnlink.and.callFake((file, cb) => { cb(); });


        spyLogError = spyOn(op, 'logError');
    };

    it('reads picture and video upload directories', (done) => {
        op.execute((response: fileCleanupOp.IFileCleanupResponse) => {
            expect(response.error).toBeNull();
            expect(spyFsReadDir.calls.count()).toEqual(2);
            var folders = [spyFsReadDir.calls.argsFor(0)[0], spyFsReadDir.calls.argsFor(1)[0]];
            expect(folders).toContain('./uploads/videos/');
            expect(folders).toContain('./uploads/pictures/');
            done();
        });
    });

    it('collects file creation time', (done) => {
        op.execute((response: fileCleanupOp.IFileCleanupResponse) => {
            expect(response.error).toBeNull();
            expect(spyFsStat.calls.count()).toEqual(7);
            done();
        });
    });

    it('checks usages in post and account collections for old files', (done) => {
        op.execute((response: fileCleanupOp.IFileCleanupResponse) => {
            expect(response.error).toBeNull();
            expect(spyDbToArray.calls.count()).toEqual(2);
            done();
        });
    });

    it('removes files that are not used in database', (done) => {
        op.execute((response: fileCleanupOp.IFileCleanupResponse) => {
            expect(response.error).toBeNull();
            expect(spyFsUnlink.calls.count()).toEqual(2);
            var files = [spyFsUnlink.calls.argsFor(0)[0], spyFsUnlink.calls.argsFor(1)[0]];
            expect(files).toContain('./uploads/videos/vid3.avi');
            expect(files).toContain('./uploads/pictures/somePic3.jpg');
            done();
        });
    });

    it('logs warning that some old files were not optimized', (done) => {
        op.execute((response: fileCleanupOp.IFileCleanupResponse) => {
            expect(response.error).toBeNull();
            var errorMsg = spyLogError.calls.argsFor(0)[0];
            expect(errorMsg).toContain('vid2.avi');
            expect(errorMsg).toContain('somePic2.jpg');
            expect(errorMsg).toContain('logo.jpg');
            done();
        });
    });

    it('indicates that job have worked when at least one file was deleted', (done) => {
        op.execute((response: fileCleanupOp.IFileCleanupResponse) => {
            expect(response.error).toBeNull();
            expect(response.haveWorked).toBeTruthy();
            done();
        });
    });

    it('indicates that job have not worked when no files were deleted', (done) => {
        op = new fileCleanupOp.FileCleanupOpration(req);
        mock = mocker.OperationMocker.mock(op);
        setupSpies();

        spyDbToArray = spyOn(mock.collectionMock, 'toArray');
        spyDbToArray.and.callFake((cb) => {
            var posts = [
                {pictureUrl: '/uploads/videos/vid1.mp4'},
                {pictureUrl: '/uploads/videos/vid2.avi'},
                {pictureUrl: '/uploads/videos/vid3.avi'},
                {pictureUrl: '/uploads/pictures/somePic1.png'},
                {pictureUrl: '/uploads/pictures/somePic2.jpg'},
                {pictureUrl: '/uploads/pictures/somePic3.jpg'},
                {pictureUrl: '/uploads/pictures/logo.jpg'}
            ];

            var result = mock.collectionMock.name === accountEntity.CollectionName
                ? []
                : posts;

            var pictures = ['somePic1.png', 'somePic2.jpg', 'somePic3.jpg', 'logo.jpg'];
            var videos = ['vid1.mp4', 'vid2.avi', 'vid3.avi'];

            cb(null, result);
        });

        op.execute((response: fileCleanupOp.IFileCleanupResponse) => {
            expect(response.error).toBeNull();
            expect(response.haveWorked).toBeFalsy();
            expect(spyFsUnlink).not.toHaveBeenCalled();
            done();
        });
    });
});