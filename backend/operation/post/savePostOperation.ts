/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import postEntity = require('../../entities/postEntity');
import cons = require('../../core/constants');

export class SavePostOperation extends operation.Operation {
    protected request: ISavePostRequest;

    public execute(cb: (response: ISavePostResponse) => void) {
        this.async.waterfall([
                this.savePost
            ],
            this.respond.bind(this, cb));
    }

    private savePost = (next) => {
        var post = this.mapRequestToEntity(this.request);
        this.save(postEntity.CollectionName, post, next);
    };

    private mapRequestToEntity(request: ISavePostRequest){
        var accountId = this.getObjectId(request.accountId);
        var post = new postEntity.PostEntity();
        post.title = request.title;
        post.pictureUrl = request.contentUrl;
        post.ownerId = accountId;
        post.pictureType = request.contentType;
        post.favs = 1;

        var paw = new postEntity.PawEntity();
        paw.ownerId = accountId;
        paw.createdOn = new Date();
        post.paws = [paw];
        return post;
    }

    private respond(cb: (response: ISavePostResponse) => void, err) {
        var response: ISavePostResponse = {error: err};
        cb(response);
    }
}