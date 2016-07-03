/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import postEntity = require('../../entities/postEntity');
import activityEntity = require('../../entities/activityEntity');

export class TogglePostPawOperation extends operation.Operation {
    protected request: ITogglePostPawRequest;
    private post: postEntity.PostEntity;
    private isPawSet: boolean;
    private paw: postEntity.PawEntity;

    public execute(cb: (response: ITogglePostPawResponse) => void) {
        this.async.waterfall([
                this.getPost,
                this.togglePaw,
                this.savePost,
                this.addRemoveActivityForPostOwner
            ],
            this.respond.bind(this, cb));
    }

    private getPost = (next) => {
        this.findOne(postEntity.CollectionName, {_id: this.getObjectId(this.request.postId) }, (err, res) => {
            this.post = res;
            next(err);
        })
    };

    private togglePaw = (next) => {
        var isPawSet = false;
        var accountId = this.currentUserObjectId();

        var paw = new postEntity.PawEntity();
        paw.ownerId = accountId;
        paw.createdOn = new Date();

        if (!this.post.paws || this.post.paws.length === 0){
            isPawSet = true;
            this.post.paws = [paw];
        }
        else{
            var index = this._.findIndex(this.post.paws, (paw) => {
                return paw.ownerId.equals(accountId);
            });

            if (index === -1){
                isPawSet = true;
                this.post.paws.push(paw);
            }
            else{
                this.post.paws.splice(index, 1);
            }
        }

        this.updatePostFavs(this.post, isPawSet);
        this.isPawSet = isPawSet;
        next();
    };

    private updatePostFavs(post: postEntity.PostEntity, isPawSet: boolean){
        var favDiff = isPawSet ? 1 : -1;
        post.favs += favDiff;
    }

    private savePost = (next) => {
        this.save(postEntity.CollectionName, this.post, (err, res) => {
            next(err);
        });
    };

    private addRemoveActivityForPostOwner = (next) => {
        var query = new activityEntity.ActivityEntity();
        query.accountId = this.post.ownerId;
        query.type = ActivityType.MyPostPaw;
        query.relatedId = this.post._id;
        query.data = {pawOwnerId: this.currentUserObjectId()};

        this.findOne(activityEntity.CollectionName, query, (err, res) => {
            if (err){
                this.logDbError(err, activityEntity.CollectionName);
            }
            else{
                if (!res && this.isPawSet) {
                    this.insertActivity();
                }
                else if (res && !this.isPawSet){
                    this.remove(activityEntity.CollectionName, {_id: res._id}, () => {});
                }
            }
        });

        next();
    };

    private insertActivity(){
        if (this.post.ownerId.toString() === this.currentUserId()){
            return;
        }

        var activity = new activityEntity.ActivityEntity();
        activity.accountId = this.post.ownerId;
        activity.createdOn = new Date();
        activity.title = this.post.title;
        activity.type = ActivityType.MyPostPaw;
        activity.relatedId = this.post._id;

        this.db.collection(activityEntity.CollectionName).insert(activity, () => {});
    }

    private respond(cb: (response: ITogglePostPawResponse) => void, err) {
        var response: ITogglePostPawResponse = {
            error: err,
            isPawSet: this.isPawSet
        };

        cb(response);
    }
}
