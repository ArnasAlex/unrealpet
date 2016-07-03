/// <reference path="../typings/refs.d.ts" />
import iexpress = require('express');
import controller = require('./base/controller');
import savePostOp = require('../operation/post/savePostOperation');
import editPostOp = require('../operation/post/editPostOperation');
import getPostsOp = require('../operation/post/getPostsOperation');
import getPostOp = require('../operation/post/getPostOperation');
import getPetPostsOp = require('../operation/post/getPetPostsOperation');
import uploadPostPicOp = require('../operation/post/uploadPostPictureOperation');
import uploadPostVidOp = require('../operation/post/uploadPostVideoOperation');
import togglePostPawOp = require('../operation/post/togglePostPawOperation');
import saveCommentOp = require('../operation/post/savePostCommentOperation');
import getCommentsOp = require('../operation/post/getPostCommentsOperation');
import togglePostCommentPawOp = require('../operation/post/togglePostCommentPawOperation');
import editUploadedPostPictureOp = require('../operation/post/editUploadedPostPictureOperation');
import getPetPostDetailsOp = require('../operation/post/getPetPostDetailsOperation');

export class PostController extends controller.Controller {
    public getConfig(): IControllerConfig {
        return {
            name: 'post',
            actions: [
                {
                    name: 'savePost',
                    func: this.savePost,
                    method: HttpMethod.post,
                    roles: [Role.Authenticated]
                },
                {
                    name: 'editPost',
                    func: this.editPost,
                    method: HttpMethod.post,
                    roles: [Role.Authenticated]
                },
                {
                    name: 'getPosts',
                    func: this.getPosts,
                    method: HttpMethod.get,
                    roles: []
                },
                {
                    name: 'getPetPosts',
                    func: this.getPetPosts,
                    method: HttpMethod.get,
                    roles: []
                },
                {
                    name: 'getPost',
                    func: this.getPost,
                    method: HttpMethod.get,
                    roles: []
                },
                {
                    name: 'uploadPostPicture',
                    func: this.uploadPostPicture,
                    method: HttpMethod.post,
                    roles: [Role.Authenticated]
                },
                {
                    name: 'uploadPostVideo',
                    func: this.uploadPostVideo,
                    method: HttpMethod.post,
                    roles: [Role.Authenticated]
                },
                {
                    name: 'togglePostPaw',
                    func: this.togglePostPaw,
                    method: HttpMethod.post,
                    roles: [Role.Authenticated]
                },
                {
                    name: 'saveComment',
                    func: this.saveComment,
                    method: HttpMethod.post,
                    roles: [Role.Authenticated]
                },
                {
                    name: 'getComments',
                    func: this.getComments,
                    method: HttpMethod.get,
                    roles: []
                },
                {
                    name: 'togglePostCommentPaw',
                    func: this.togglePostCommentPaw,
                    method: HttpMethod.post,
                    roles: [Role.Authenticated]
                },
                {
                    name: 'editUploadedPostPicture',
                    func: this.editUploadedPostPicture,
                    method: HttpMethod.post,
                    roles: [Role.Authenticated]
                },
                {
                    name: 'getPetPostDetails',
                    func: this.getPetPostDetails,
                    method: HttpMethod.get,
                    roles: []
                }
            ]
        }
    }

    private savePost = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        var request: ISavePostRequest = this.getPayload(req);

        new savePostOp.SavePostOperation(request).execute((response) => {
            res.send(response);
        });
    };

    private editPost = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        new editPostOp.EditPostOperation(null, req).execute((response) => {
            res.send(response);
        });
    };

    private getPosts = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        var request: IGetPostsRequest = this.getPayload(req);

        new getPostsOp.GetPostsOperation(request).execute((response) => {
            res.send(response);
        });
    };

    private getPost = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        new getPostOp.GetPostOperation(null, req).execute((response) => {
            res.send(response);
        });
    };

    private getPetPosts = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        var request: IGetPetPostsRequest = this.getPayload(req);

        new getPetPostsOp.GetPetPostsOperation(request).execute((response) => {
            res.send(response);
        });
    };

    private uploadPostPicture = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        var request: IUploadPostPictureRequest = {
            expressRequest: req,
            expressResponse: res,
            accountId: req.user.id
        };

        new uploadPostPicOp.UploadPostPictureOperation(request).execute((response) => {
            res.send(response);
        });
    };

    private uploadPostVideo = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        var request: IUploadPostVideoRequest = {
            expressRequest: req,
            expressResponse: res,
            accountId: req.user.id
        };

        new uploadPostVidOp.UploadPostVideoOperation(request).execute((response) => {
            res.send(response);
        });
    };

    private togglePostPaw = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        new togglePostPawOp.TogglePostPawOperation(null, req, res).execute((response) => {
            res.send(response);
        });
    };

    private saveComment = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        new saveCommentOp.SavePostCommentOperation(null, req, res).execute((response) => {
            res.send(response);
        });
    };

    private getComments = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        new getCommentsOp.GetPostCommentsOperation(null, req, res).execute((response) => {
            res.send(response);
        });
    };

    private togglePostCommentPaw = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        var request: ITogglePostCommentPawRequest = this.getPayload(req);

        new togglePostCommentPawOp.TogglePostCommentPawOperation(request).execute((response) => {
            res.send(response);
        });
    };

    private editUploadedPostPicture = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        var request: IEditPictureRequest = this.getPayload(req);

        new editUploadedPostPictureOp.EditUploadedPostPictureOperation(request).execute((response) => {
            res.send(response);
        });
    };

    private getPetPostDetails = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        var request: IGetPetPostDetailsRequest = this.getPayload(req);

        new getPetPostDetailsOp.GetPetPostDetailsOperation(request).execute((response) => {
            res.send(response);
        });
    };
}