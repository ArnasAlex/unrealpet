/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import postEntity = require('../../entities/postEntity');
import cons = require('../../core/constants');

export class EditPostOperation extends operation.Operation {
    protected request: IEditPostRequest;

    public execute(cb: (response: IEditPostResponse) => void) {
        this.async.waterfall([
                this.getPost,
                this.checkPermissions,
                this.editPost
            ],
            this.respond.bind(this, cb));
    }

    private getPost = (next) => {
        this.mustFindOne(postEntity.CollectionName, {_id: this.getObjectId(this.request.id)}, next);
    };

    private checkPermissions = (post: postEntity.PostEntity, next) => {
        if (this.currentUserId() === post.ownerId.toString() || this.isAdmin()){
            next(null, post);
        }
        else{
            this.logError('User trying to edit post without permissions. UserId: ' + this.currentUserId()
                + ", PostId: " + post._id.toString());
            next(this.defaultErrorMsg());
        }
    };

    private editPost = (post, next) => {
        if (this.request.isRemoval){
            this.removePost(post, next);
        }
        else{
            this.editPostInfo(post, next);
        }
    };

    private removePost = (post, next) => {
        this.save(postEntity.DeletedCollectionName, post, (err, res) => {
            if (!err){
                this.delete(postEntity.CollectionName, {_id: post._id}, next);
            }
            else{
                next(err);
            }
        });
    };

    private editPostInfo = (post: postEntity.PostEntity, next) => {
        post.title = this.request.title;
        this.save(postEntity.CollectionName, post, next);
    };

    private respond(cb: (response: IEditPostResponse) => void, err) {
        var response: IEditPostResponse = {error: err};
        cb(response);
    }
}