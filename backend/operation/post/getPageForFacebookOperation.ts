/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import postEntity = require('../../entities/postEntity');
import express = require('express');
import fs = require('fs');
import constants = require('../../core/constants');

export class GetPageForFacebookOperation extends operation.Operation {
    protected request: IGetPageForFacebookRequest;
    private cb: (response: IGetPageForFacebookResponse) => void;
    private post: postEntity.PostEntity;

    public execute(cb: (response: IGetPageForFacebookResponse) => void) {
        this.cb = cb;
        this.async.waterfall([
                this.parseUrl,
                this.getPost,
                this.getHtml,
                this.updateHtml,
            ],
            this.respond);
    }

    private parseUrl = (next) => {
        var req = this.request.req;
        var postId = req.query.post;
        next(null, postId);
    };

    private getPost = (postId: string, next) => {
        var query = {_id: this.getObjectId(postId)};
        this.findOne(postEntity.CollectionName, query, (err, post) => {
            if (err){
                next(err);
                return;
            }

            if (post){
                this.post = post;
            }
            else{
                this.logError('Post not found by id when getting page for facebook. Id: ' + postId);
                err = this.defaultErrorMsg();
            }

            next(err)
        });
    };

    private getHtml = (next) => {
        var path = './frontend/postForFacebook.html';
        this.fsReadFile(path, next);
    };

    private fsReadFile = (path: string, next) => {
        fs.readFile(path, 'utf8', next);
    };

    private updateHtml = (content: string, next) => {
        var content = content.replace('{{Title}}', this.post.title);
        content = content.replace('{{Description}}', 'Find more funny, amazing, unreal pets on www.unrealpet.com');

        var re = new RegExp('{{Url}}', 'g');
        content = content.replace(re, 'http://www.unrealpet.com' + this.request.req.url);

        var picture =  this.getPicture();
        re = new RegExp('{{Image}}', 'g');
        content = content.replace(re, picture);

        next(null, content);
    };

    private getPicture = () =>{
        var pic: string;
        if (this.post.pictureType !== PostContentType.Video){
            pic = this.post.pictureUrl;
        }
        else{
            var vidUrl = this.post.pictureUrl;
            pic = vidUrl.substr(0, vidUrl.lastIndexOf('.') + 1) + constants.Constants.defaultPictureExtension;
        }

        if (pic.indexOf('/uploads') === 0){
            pic = 'http://www.unrealpet.com' + pic;
        }

        return pic;
    };

    private respond: any = (err, content) => {
        var response: IGetPageForFacebookResponse = {
            error: err,
            content: content
        };

        this.cb(response);
    }
}

export interface IGetPageForFacebookRequest extends IRequest {
    req: express.Request;
}

export interface IGetPageForFacebookResponse extends IResponse {
    content: string;
}