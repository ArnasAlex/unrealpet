/// <reference path="../../../typings/refs.d.ts" />
import getOp = require('../../../../../backend/operation/post/getPageForFacebookOperation');
import post = require('../../../../../backend/entities/postEntity');
import mocker = require('../../../helper/operationMocker');

describe('Get page for facebook',() => {
    var req: getOp.IGetPageForFacebookRequest;
    var op: getOp.GetPageForFacebookOperation;
    var mock: mocker.IMockedOperation;
    var spyFsRead: jasmine.Spy;
    var getQuery;
    var postFromDb: post.PostEntity;

    beforeEach(() => {
        req = {
            req: <any>{
                query:{
                    post: mocker.OperationMocker.getId().toString()
                },
                url: '?post=somePostId'
            }
        };
        op = new getOp.GetPageForFacebookOperation(req);
        spyFsRead = spyOn(op, 'fsReadFile');
        spyFsRead.and.callFake((path, cb) => {
            cb(null, 'html content goes here. And replaces template: {{Title}} {{Description}} {{Image}} {{Url}}');
        });

        mock = mocker.OperationMocker.mock(op);

        postFromDb = new post.PostEntity();
        postFromDb._id = mocker.OperationMocker.getId();
        postFromDb.pictureType = PostContentType.UploadedPicture;
        postFromDb.pictureUrl = '/uploads/someurl.jpg';
        postFromDb.title = 'Post title123';

        mock.collectionMock.findOne = (doc, cb) => {
            getQuery = doc;
            cb(null, postFromDb);
        };
    });

    it('retrieves post', (done) => {
        op.execute((response: getOp.IGetPageForFacebookResponse) => {
            expect(response.error).toBeNull();
            expect(getQuery._id.toString()).toEqual(req.req.query.post);
            done();
        });
    });

    it('reads template html', (done) => {
        op.execute((response: getOp.IGetPageForFacebookResponse) => {
            expect(response.error).toBeNull();
            expect(spyFsRead).toHaveBeenCalledWith('./frontend/postForFacebook.html', jasmine.any(Function));
            done();
        });
    });

    it('fills post of picture type information in template.', (done) => {
        op.execute((response: getOp.IGetPageForFacebookResponse) => {
            expect(response.error).toBeNull();
            expect(response.content).toContain(postFromDb.title);
            expect(response.content).toContain('Find more funny');
            expect(response.content).toContain('http://www.unrealpet.com' + postFromDb.pictureUrl);
            expect(response.content).toContain('http://www.unrealpet.com' + req.req.url);
            done();
        });
    });

    it('fills post of video type information in template.', (done) => {
        postFromDb.pictureType = PostContentType.Video;
        postFromDb.pictureUrl = '/uploads/video.mp4';
        op.execute((response: getOp.IGetPageForFacebookResponse) => {
            expect(response.error).toBeNull();
            expect(response.content).toContain(postFromDb.title);
            expect(response.content).toContain('Find more funny');
            expect(response.content).toContain('http://www.unrealpet.com' + postFromDb.pictureUrl.replace('mp4', 'jpeg'));
            expect(response.content).toContain('http://www.unrealpet.com' + req.req.url);
            done();
        });
    });
});