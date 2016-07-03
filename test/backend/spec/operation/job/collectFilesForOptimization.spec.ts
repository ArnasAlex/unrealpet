/// <reference path="../../../typings/refs.d.ts" />
import collectOp = require('../../../../../backend/operation/job/collectFilesForOptimizationOperation');
import job = require('../../../../../backend/entities/jobDataEntity');
import mocker = require('../../../helper/operationMocker');
import constants = require('../../../../../backend/core/constants');
import postEntity = require('../../../../../backend/entities/postEntity');
import _ = require('lodash');

describe('Collect files for optimization',() => {
    var req: collectOp.ICollectFilesForOptimizationRequest;
    var op: collectOp.CollectFilesForOptimizationOperation;
    var mock: mocker.IMockedOperation;

    beforeEach(() => {
        req = {};
        op = new collectOp.CollectFilesForOptimizationOperation(req);
        mock = mocker.OperationMocker.mock(op);

        var uploadUrl = constants.Constants.pictureUploadFolderUrl;
        var accArray = [
            {logo: uploadUrl + 'someLogo1'},
            {logo: uploadUrl + 'someLogo2'},
            {picture: uploadUrl + 'accountPicture'},
        ];
        var postArray = [
            {pictureUrl: uploadUrl + 'someFile1', pictureType: PostContentType.UploadedPicture},
            {pictureUrl: uploadUrl + 'someFile2', pictureType: PostContentType.UploadedPicture},
            {pictureUrl: constants.Constants.videoUploadFolderUrl + 'someFile3', pictureType: PostContentType.Video}
        ];

        var postCollectionGetCount = 0;
        mock.collectionMock.toArray = (cb) => {
            var arr;
            if (mock.collectionMock.name === postEntity.CollectionName){
                if (postCollectionGetCount == 0){
                    arr = postArray.slice(0, 2);
                    postCollectionGetCount++;
                }
                else{
                    arr = postArray.slice(2, 3);
                }
            }
            else{
                arr = accArray;
            }

            cb(null, arr);
        };
        mock.collectionMock.setFindOneToNotFound();
    });

    it('collects post - videos, pictures, account - logos, main pictures', (done) => {
        var savedDocs: job.JobDataEntity[] = [];
        mock.collectionMock.save = (doc, cb) => {
            savedDocs.push(doc);
            cb();
        };

        op.execute((response: collectOp.ICollectFilesForOptimizationResponse) => {
            expect(response.error).toBeNull();
            expect(savedDocs.length).toEqual(6);
            expect(_.filter(savedDocs, x => x.data.type == job.FileOptimizationType.PostPicture).length).toEqual(2);
            expect(_.filter(savedDocs, x => x.data.type == job.FileOptimizationType.PostVideo).length).toEqual(1);
            expect(_.filter(savedDocs, x => x.data.type == job.FileOptimizationType.AccountLogo).length).toEqual(2);
            expect(_.filter(savedDocs, x => x.data.type == job.FileOptimizationType.AccountMainPicture).length).toEqual(1);
            done();
        });
    });

    it('creates job data for post picture', (done) => {
        var savedDocs: job.JobDataEntity[] = [];
        mock.collectionMock.save = (doc, cb) => {
            savedDocs.push(doc);
            cb();
        };

        op.execute((response: collectOp.ICollectFilesForOptimizationResponse) => {
            expect(response.error).toBeNull();
            var postPic = savedDocs[0];
            expect(postPic.type).toEqual(job.JobType.FileOptimization);
            expect(postPic.status).toEqual(job.JobDataStatus.Created);
            var data: job.IFileOptimizationJobData = postPic.data;
            expect(data.name).toEqual('someFile1');
            expect(data.type).toEqual(job.FileOptimizationType.PostPicture);
            done();
        });
    });

    it('creates job data for post video', (done) => {
        var savedDocs: job.JobDataEntity[] = [];
        mock.collectionMock.save = (doc, cb) => {
            savedDocs.push(doc);
            cb();
        };

        op.execute((response: collectOp.ICollectFilesForOptimizationResponse) => {
            expect(response.error).toBeNull();
            var postVid = savedDocs[2];
            expect(postVid.type).toEqual(job.JobType.FileOptimization);
            expect(postVid.status).toEqual(job.JobDataStatus.Created);
            var data: job.IFileOptimizationJobData = postVid.data;
            expect(data.name).toEqual('someFile3');
            expect(data.type).toEqual(job.FileOptimizationType.PostVideo);
            done();
        });
    });

    it('creates job data for account logo', (done) => {
        var savedDocs: job.JobDataEntity[] = [];
        mock.collectionMock.save = (doc, cb) => {
            savedDocs.push(doc);
            cb();
        };

        op.execute((response: collectOp.ICollectFilesForOptimizationResponse) => {
            expect(response.error).toBeNull();
            var accLogo = savedDocs[3];
            expect(accLogo.type).toEqual(job.JobType.FileOptimization);
            expect(accLogo.status).toEqual(job.JobDataStatus.Created);
            var data: job.IFileOptimizationJobData = accLogo.data;
            expect(data.name).toEqual('someLogo1');
            expect(data.type).toEqual(job.FileOptimizationType.AccountLogo);
            done();
        });
    });

    it('does not create job data if it is already created for file', (done) => {
        mock.collectionMock.findOne = (query, cb) => {
            var docToReturn;
            if (query['data.type'] === job.FileOptimizationType.PostPicture){
                if (query['data.name'] === 'someFile2' || query['data.name'] === 'someFile3'){
                    docToReturn = new job.JobDataEntity();
                }
            }
            else{
                if (query['data.name'] !== 'someLogo2'){
                    docToReturn = new job.JobDataEntity();
                }
            }

            cb(null, docToReturn);
        };

        var savedPostPicDocCount = 0;
        var savedPostVidDocCount = 0;
        var savedAccPicDocCount = 0;
        mock.collectionMock.save = (doc, cb) => {
            switch (doc.data.type){
                case job.FileOptimizationType.PostPicture:
                    savedPostPicDocCount++;
                    break;
                case job.FileOptimizationType.PostVideo:
                    savedPostVidDocCount++;
                    break;
                case job.FileOptimizationType.AccountLogo:
                    savedAccPicDocCount++;
                    break;
            }
            cb();
        };

        op.execute((response: collectOp.ICollectFilesForOptimizationResponse) => {
            expect(response.error).toBeNull();
            expect(savedPostPicDocCount).toEqual(1);
            expect(savedPostVidDocCount).toEqual(0);
            expect(savedAccPicDocCount).toEqual(1);
            done();
        });
    });
});