var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var postEntity = require('../../entities/postEntity');
var fs = require('fs');
var constants = require('../../core/constants');
var GetPageForFacebookOperation = (function (_super) {
    __extends(GetPageForFacebookOperation, _super);
    function GetPageForFacebookOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.parseUrl = function (next) {
            var req = _this.request.req;
            var postId = req.query.post;
            next(null, postId);
        };
        this.getPost = function (postId, next) {
            var query = { _id: _this.getObjectId(postId) };
            _this.findOne(postEntity.CollectionName, query, function (err, post) {
                if (err) {
                    next(err);
                    return;
                }
                if (post) {
                    _this.post = post;
                }
                else {
                    _this.logError('Post not found by id when getting page for facebook. Id: ' + postId);
                    err = _this.defaultErrorMsg();
                }
                next(err);
            });
        };
        this.getHtml = function (next) {
            var path = './frontend/postForFacebook.html';
            _this.fsReadFile(path, next);
        };
        this.fsReadFile = function (path, next) {
            fs.readFile(path, 'utf8', next);
        };
        this.updateHtml = function (content, next) {
            var content = content.replace('{{Title}}', _this.post.title);
            content = content.replace('{{Description}}', 'Find more funny, amazing, unreal pets on www.unrealpet.com');
            var re = new RegExp('{{Url}}', 'g');
            content = content.replace(re, 'http://www.unrealpet.com' + _this.request.req.url);
            var picture = _this.getPicture();
            re = new RegExp('{{Image}}', 'g');
            content = content.replace(re, picture);
            next(null, content);
        };
        this.getPicture = function () {
            var pic;
            if (_this.post.pictureType !== 3) {
                pic = _this.post.pictureUrl;
            }
            else {
                var vidUrl = _this.post.pictureUrl;
                pic = vidUrl.substr(0, vidUrl.lastIndexOf('.') + 1) + constants.Constants.defaultPictureExtension;
            }
            if (pic.indexOf('/uploads') === 0) {
                pic = 'http://www.unrealpet.com' + pic;
            }
            return pic;
        };
        this.respond = function (err, content) {
            var response = {
                error: err,
                content: content
            };
            _this.cb(response);
        };
    }
    GetPageForFacebookOperation.prototype.execute = function (cb) {
        this.cb = cb;
        this.async.waterfall([
            this.parseUrl,
            this.getPost,
            this.getHtml,
            this.updateHtml,
        ], this.respond);
    };
    return GetPageForFacebookOperation;
})(operation.Operation);
exports.GetPageForFacebookOperation = GetPageForFacebookOperation;
//# sourceMappingURL=getPageForFacebookOperation.js.map