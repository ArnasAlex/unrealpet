var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var controller = require('./base/controller');
var savePostOp = require('../operation/post/savePostOperation');
var editPostOp = require('../operation/post/editPostOperation');
var getPostsOp = require('../operation/post/getPostsOperation');
var getPostOp = require('../operation/post/getPostOperation');
var getPetPostsOp = require('../operation/post/getPetPostsOperation');
var uploadPostPicOp = require('../operation/post/uploadPostPictureOperation');
var uploadPostVidOp = require('../operation/post/uploadPostVideoOperation');
var togglePostPawOp = require('../operation/post/togglePostPawOperation');
var saveCommentOp = require('../operation/post/savePostCommentOperation');
var getCommentsOp = require('../operation/post/getPostCommentsOperation');
var togglePostCommentPawOp = require('../operation/post/togglePostCommentPawOperation');
var editUploadedPostPictureOp = require('../operation/post/editUploadedPostPictureOperation');
var getPetPostDetailsOp = require('../operation/post/getPetPostDetailsOperation');
var PostController = (function (_super) {
    __extends(PostController, _super);
    function PostController() {
        var _this = this;
        _super.apply(this, arguments);
        this.savePost = function (req, res, next) {
            var request = _this.getPayload(req);
            new savePostOp.SavePostOperation(request).execute(function (response) {
                res.send(response);
            });
        };
        this.editPost = function (req, res, next) {
            new editPostOp.EditPostOperation(null, req).execute(function (response) {
                res.send(response);
            });
        };
        this.getPosts = function (req, res, next) {
            var request = _this.getPayload(req);
            new getPostsOp.GetPostsOperation(request).execute(function (response) {
                res.send(response);
            });
        };
        this.getPost = function (req, res, next) {
            new getPostOp.GetPostOperation(null, req).execute(function (response) {
                res.send(response);
            });
        };
        this.getPetPosts = function (req, res, next) {
            var request = _this.getPayload(req);
            new getPetPostsOp.GetPetPostsOperation(request).execute(function (response) {
                res.send(response);
            });
        };
        this.uploadPostPicture = function (req, res, next) {
            var request = {
                expressRequest: req,
                expressResponse: res,
                accountId: req.user.id
            };
            new uploadPostPicOp.UploadPostPictureOperation(request).execute(function (response) {
                res.send(response);
            });
        };
        this.uploadPostVideo = function (req, res, next) {
            var request = {
                expressRequest: req,
                expressResponse: res,
                accountId: req.user.id
            };
            new uploadPostVidOp.UploadPostVideoOperation(request).execute(function (response) {
                res.send(response);
            });
        };
        this.togglePostPaw = function (req, res, next) {
            new togglePostPawOp.TogglePostPawOperation(null, req, res).execute(function (response) {
                res.send(response);
            });
        };
        this.saveComment = function (req, res, next) {
            new saveCommentOp.SavePostCommentOperation(null, req, res).execute(function (response) {
                res.send(response);
            });
        };
        this.getComments = function (req, res, next) {
            new getCommentsOp.GetPostCommentsOperation(null, req, res).execute(function (response) {
                res.send(response);
            });
        };
        this.togglePostCommentPaw = function (req, res, next) {
            var request = _this.getPayload(req);
            new togglePostCommentPawOp.TogglePostCommentPawOperation(request).execute(function (response) {
                res.send(response);
            });
        };
        this.editUploadedPostPicture = function (req, res, next) {
            var request = _this.getPayload(req);
            new editUploadedPostPictureOp.EditUploadedPostPictureOperation(request).execute(function (response) {
                res.send(response);
            });
        };
        this.getPetPostDetails = function (req, res, next) {
            var request = _this.getPayload(req);
            new getPetPostDetailsOp.GetPetPostDetailsOperation(request).execute(function (response) {
                res.send(response);
            });
        };
    }
    PostController.prototype.getConfig = function () {
        return {
            name: 'post',
            actions: [
                {
                    name: 'savePost',
                    func: this.savePost,
                    method: 2,
                    roles: [1]
                },
                {
                    name: 'editPost',
                    func: this.editPost,
                    method: 2,
                    roles: [1]
                },
                {
                    name: 'getPosts',
                    func: this.getPosts,
                    method: 1,
                    roles: []
                },
                {
                    name: 'getPetPosts',
                    func: this.getPetPosts,
                    method: 1,
                    roles: []
                },
                {
                    name: 'getPost',
                    func: this.getPost,
                    method: 1,
                    roles: []
                },
                {
                    name: 'uploadPostPicture',
                    func: this.uploadPostPicture,
                    method: 2,
                    roles: [1]
                },
                {
                    name: 'uploadPostVideo',
                    func: this.uploadPostVideo,
                    method: 2,
                    roles: [1]
                },
                {
                    name: 'togglePostPaw',
                    func: this.togglePostPaw,
                    method: 2,
                    roles: [1]
                },
                {
                    name: 'saveComment',
                    func: this.saveComment,
                    method: 2,
                    roles: [1]
                },
                {
                    name: 'getComments',
                    func: this.getComments,
                    method: 1,
                    roles: []
                },
                {
                    name: 'togglePostCommentPaw',
                    func: this.togglePostCommentPaw,
                    method: 2,
                    roles: [1]
                },
                {
                    name: 'editUploadedPostPicture',
                    func: this.editUploadedPostPicture,
                    method: 2,
                    roles: [1]
                },
                {
                    name: 'getPetPostDetails',
                    func: this.getPetPostDetails,
                    method: 1,
                    roles: []
                }
            ]
        };
    };
    return PostController;
})(controller.Controller);
exports.PostController = PostController;
//# sourceMappingURL=postController.js.map