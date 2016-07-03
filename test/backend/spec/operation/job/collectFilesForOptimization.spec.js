/// <reference path="../../../typings/refs.d.ts" />
var collectOp = require('../../../../../backend/operation/job/collectFilesForOptimizationOperation');
var job = require('../../../../../backend/entities/jobDataEntity');
var mocker = require('../../../helper/operationMocker');
var constants = require('../../../../../backend/core/constants');
var postEntity = require('../../../../../backend/entities/postEntity');
var _ = require('lodash');
describe('Collect files for optimization', function () {
    var req;
    var op;
    var mock;
    beforeEach(function () {
        req = {};
        op = new collectOp.CollectFilesForOptimizationOperation(req);
        mock = mocker.OperationMocker.mock(op);
        var uploadUrl = constants.Constants.pictureUploadFolderUrl;
        var accArray = [
            { logo: uploadUrl + 'someLogo1' },
            { logo: uploadUrl + 'someLogo2' },
            { picture: uploadUrl + 'accountPicture' },
        ];
        var postArray = [
            { pictureUrl: uploadUrl + 'someFile1', pictureType: 1 },
            { pictureUrl: uploadUrl + 'someFile2', pictureType: 1 },
            { pictureUrl: constants.Constants.videoUploadFolderUrl + 'someFile3', pictureType: 3 }
        ];
        var postCollectionGetCount = 0;
        mock.collectionMock.toArray = function (cb) {
            var arr;
            if (mock.collectionMock.name === postEntity.CollectionName) {
                if (postCollectionGetCount == 0) {
                    arr = postArray.slice(0, 2);
                    postCollectionGetCount++;
                }
                else {
                    arr = postArray.slice(2, 3);
                }
            }
            else {
                arr = accArray;
            }
            cb(null, arr);
        };
        mock.collectionMock.setFindOneToNotFound();
    });
    it('collects post - videos, pictures, account - logos, main pictures', function (done) {
        var savedDocs = [];
        mock.collectionMock.save = function (doc, cb) {
            savedDocs.push(doc);
            cb();
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(savedDocs.length).toEqual(6);
            expect(_.filter(savedDocs, function (x) { return x.data.type == 1; }).length).toEqual(2);
            expect(_.filter(savedDocs, function (x) { return x.data.type == 3; }).length).toEqual(1);
            expect(_.filter(savedDocs, function (x) { return x.data.type == 2; }).length).toEqual(2);
            expect(_.filter(savedDocs, function (x) { return x.data.type == 4; }).length).toEqual(1);
            done();
        });
    });
    it('creates job data for post picture', function (done) {
        var savedDocs = [];
        mock.collectionMock.save = function (doc, cb) {
            savedDocs.push(doc);
            cb();
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            var postPic = savedDocs[0];
            expect(postPic.type).toEqual(1);
            expect(postPic.status).toEqual(1);
            var data = postPic.data;
            expect(data.name).toEqual('someFile1');
            expect(data.type).toEqual(1);
            done();
        });
    });
    it('creates job data for post video', function (done) {
        var savedDocs = [];
        mock.collectionMock.save = function (doc, cb) {
            savedDocs.push(doc);
            cb();
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            var postVid = savedDocs[2];
            expect(postVid.type).toEqual(1);
            expect(postVid.status).toEqual(1);
            var data = postVid.data;
            expect(data.name).toEqual('someFile3');
            expect(data.type).toEqual(3);
            done();
        });
    });
    it('creates job data for account logo', function (done) {
        var savedDocs = [];
        mock.collectionMock.save = function (doc, cb) {
            savedDocs.push(doc);
            cb();
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            var accLogo = savedDocs[3];
            expect(accLogo.type).toEqual(1);
            expect(accLogo.status).toEqual(1);
            var data = accLogo.data;
            expect(data.name).toEqual('someLogo1');
            expect(data.type).toEqual(2);
            done();
        });
    });
    it('does not create job data if it is already created for file', function (done) {
        mock.collectionMock.findOne = function (query, cb) {
            var docToReturn;
            if (query['data.type'] === 1) {
                if (query['data.name'] === 'someFile2' || query['data.name'] === 'someFile3') {
                    docToReturn = new job.JobDataEntity();
                }
            }
            else {
                if (query['data.name'] !== 'someLogo2') {
                    docToReturn = new job.JobDataEntity();
                }
            }
            cb(null, docToReturn);
        };
        var savedPostPicDocCount = 0;
        var savedPostVidDocCount = 0;
        var savedAccPicDocCount = 0;
        mock.collectionMock.save = function (doc, cb) {
            switch (doc.data.type) {
                case 1:
                    savedPostPicDocCount++;
                    break;
                case 3:
                    savedPostVidDocCount++;
                    break;
                case 2:
                    savedAccPicDocCount++;
                    break;
            }
            cb();
        };
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(savedPostPicDocCount).toEqual(1);
            expect(savedPostVidDocCount).toEqual(0);
            expect(savedAccPicDocCount).toEqual(1);
            done();
        });
    });
});
//# sourceMappingURL=collectFilesForOptimization.spec.js.map