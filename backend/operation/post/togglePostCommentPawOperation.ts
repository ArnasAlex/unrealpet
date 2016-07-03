/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import postEntity = require('../../entities/postEntity');

export class TogglePostCommentPawOperation extends operation.Operation {
    protected request: ITogglePostCommentPawRequest;

    public execute(cb: (response: ITogglePostCommentPawResponse) => void) {
        this.async.waterfall([
                this.getPost.bind(this),
                this.togglePaw.bind(this),
                this.savePost.bind(this)
            ],
            this.respond.bind(this, cb));
    }

    private getPost(next) {
        this.findOne(postEntity.CollectionName, {_id: this.getObjectId(this.request.postId) }, (err, res) => {
            next(err, res);
        })
    }

    private togglePaw(post: postEntity.PostEntity, next){
        var comment = this.getComment(post, this.request.commentId);
        var accountId = this.getObjectId(this.request.accountId);

        var isPawSet = false;
        var paw = new postEntity.PawEntity();
        paw.ownerId = accountId;
        paw.createdOn = new Date();

        if (!comment.paws || comment.paws.length === 0){
            comment.paws = [paw];
            isPawSet = true;
        }
        else{
            var index = this._.findIndex(comment.paws, (paw) => {
                return paw.ownerId.equals(accountId);
            });

            if (index === -1){
                comment.paws.push(paw);
                isPawSet = true;
            }
            else{
                comment.paws.splice(index, 1);
            }
        }

        this.updatePostFavs(post, isPawSet);
        next(null, post, isPawSet);
    }

    private updatePostFavs(post: postEntity.PostEntity, isPawSet: boolean){
        var favDiff = isPawSet ? 1 : -1;
        post.favs += favDiff;
    }

    private getComment(post: postEntity.PostEntity, commentId: string){
        var id = this.getObjectId(commentId);
        return this._.find(post.comments, x => x._id.equals(id));
    }

    private savePost(post: postEntity.PostEntity, isPawSet: boolean, next) {
        this.save(postEntity.CollectionName, post, (err, res) => {
            next(err, isPawSet);
        });
    }

    private respond(cb: (response: ITogglePostCommentPawResponse) => void, err, isPawSet: boolean) {
        var response: ITogglePostCommentPawResponse = {
            error: err,
            isPawSet: isPawSet
        };

        cb(response);
    }
}