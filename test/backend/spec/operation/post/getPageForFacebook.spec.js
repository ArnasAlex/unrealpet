/// <reference path="../../../typings/refs.d.ts" />
var getOp = require('../../../../../backend/operation/post/getPageForFacebookOperation');
var post = require('../../../../../backend/entities/postEntity');
var mocker = require('../../../helper/operationMocker');
describe('Get page for facebook', function () {
    var req;
    var op;
    var mock;
    var spyFsRead;
    var getQuery;
    var postFromDb;
    beforeEach(function () {
        req = {
            req: {
                query: {
                    post: mocker.OperationMocker.getId().toString()
                },
                url: '?post=somePostId'
            }
        };
        op = new getOp.GetPageForFacebookOperation(req);
        spyFsRead = spyOn(op, 'fsReadFile');
        spyFsRead.and.callFake(function (path, cb) {
            cb(null, 'html content goes here. And replaces template: {{Title}} {{Description}} {{Image}} {{Url}}');
        });
        mock = mocker.OperationMocker.mock(op);
        postFromDb = new post.PostEntity();
        postFromDb._id = mocker.OperationMocker.getId();
        postFromDb.pictureType = 1;
        postFromDb.pictureUrl = '/uploads/someurl.jpg';
        postFromDb.title = 'Post title123';
        mock.collectionMock.findOne = function (doc, cb) {
            getQuery = doc;
            cb(null, postFromDb);
        };
    });
    it('retrieves post', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(getQuery._id.toString()).toEqual(req.req.query.post);
            done();
        });
    });
    it('reads template html', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(spyFsRead).toHaveBeenCalledWith('./frontend/postForFacebook.html', jasmine.any(Function));
            done();
        });
    });
    it('fills post of picture type information in template.', function (done) {
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.content).toContain(postFromDb.title);
            expect(response.content).toContain('Find more funny');
            expect(response.content).toContain('http://www.unrealpet.com' + postFromDb.pictureUrl);
            expect(response.content).toContain('http://www.unrealpet.com' + req.req.url);
            done();
        });
    });
    it('fills post of video type information in template.', function (done) {
        postFromDb.pictureType = 3;
        postFromDb.pictureUrl = '/uploads/video.mp4';
        op.execute(function (response) {
            expect(response.error).toBeNull();
            expect(response.content).toContain(postFromDb.title);
            expect(response.content).toContain('Find more funny');
            expect(response.content).toContain('http://www.unrealpet.com' + postFromDb.pictureUrl.replace('mp4', 'jpeg'));
            expect(response.content).toContain('http://www.unrealpet.com' + req.req.url);
            done();
        });
    });
});
//# sourceMappingURL=getPageForFacebook.spec.js.map