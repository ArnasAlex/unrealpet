/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import postEntity = require('../../entities/postEntity');
import commentEntity = require('../../entities/commentEntity');
import accountEntity = require('../../entities/accountEntity');
import activityEntity = require('../../entities/activityEntity');
import _ = require('lodash');

export class SavePostCommentOperation extends operation.Operation {
    protected request: ISavePostCommentRequest;

    private post: postEntity.PostEntity;
    private newComment: commentEntity.CommentEntity;

    public execute(cb: (response: ISavePostCommentResponse) => void) {
        this.async.waterfall([
                this.getPost,
                this.addComment,
                this.updateOwnerViewedOn,
                this.addActivities,
                this.savePost,
                this.createResponse
            ],
            this.respond.bind(this, cb));
    }

    private getPost = (next) => {
        this.findOne(postEntity.CollectionName, {_id: this.getObjectId(this.request.postId) }, (err, res) => {
            this.post = res;
            next(err);
        });
    };

    private addComment = (next) => {
        if (!this.post.comments){
            this.post.comments = [];
        }

        var comment = this.createCommentFromRequest();
        this.post.comments.push(comment);
        this.post.favs++;
        this.newComment = comment;

        next(null);
    };

    private createCommentFromRequest(){
        var accountId = this.getObjectId(this.request.accountId);

        var comment = new commentEntity.CommentEntity();
        comment.text = this.request.text;
        comment.ownerId = accountId;
        comment._id = this.getId();
        comment.createdOn = new Date();
        comment.updatedOn = new Date();

        var paw = new postEntity.PawEntity();
        paw.ownerId = accountId;
        paw.createdOn = new Date();
        comment.paws = [paw];

        if (this.request.parentCommentId){
            comment.parentCommentId = this.getObjectId(this.request.parentCommentId);
        }

        return comment;
    }

    private updateOwnerViewedOn = (next) => {
        if (this.request.accountId === this.post.ownerId.toString()){
            var nowPlusMs = new Date();
            nowPlusMs.setTime(new Date().getTime() + 1);
            this.post.ownerViewedOn = nowPlusMs;
        }

        next(null);
    };

    private addActivities = (next) => {
        var activities = [];

        var accountIds = this.getPostSubscribers();
        if (accountIds.length > 0){
            this._.each(accountIds, (accountId) => {
                var activity = new activityEntity.ActivityEntity();
                activity.createdOn = new Date();
                activity.message = this.request.text;
                activity.relatedId = this.post._id;
                activity.type = ActivityType.OthersPostComment;
                activity.title = this.post.title;
                activity.accountId = accountId;

                activities.push(activity);
            });
        }

        if (this.post.ownerId.toString() !== this.currentUserId()){
            var activity = new activityEntity.ActivityEntity();
            activity.createdOn = new Date();
            activity.message = this.request.text;
            activity.relatedId = this.post._id;
            activity.type = ActivityType.MyPostComment;
            activity.title = this.post.title;
            activity.accountId = this.post.ownerId;

            activities.push(activity);
        }

        if (activities.length > 0){
            this.db.collection(activityEntity.CollectionName).insert(activities, (err) => {
                if (err){
                    this.logDbError(err.toString(), activityEntity.CollectionName);
                }
            });
        }

        next();
    };

    private getPostSubscribers = () => {
        var accountIds = [];
        this._.each(this.post.comments, (comment: commentEntity.CommentEntity) => {
            if (this.newComment._id.toString() === comment._id.toString()){
                return;
            }

            if (comment.ownerId.toString() === this.currentUserId()){
                return;
            }

            if (comment.ownerId.toString() === this.post.ownerId.toString()){
                return;
            }

            if (this._.some(accountIds, x => x.toString() === comment.ownerId.toString())){
                return;
            }

            accountIds.push(comment.ownerId);
        });

        return accountIds;
    };

    private savePost = (next) => {
        this.save(postEntity.CollectionName, this.post, (err, res) => {
            next(err);
        });
    };

    private createResponse = (next) => {
        this.findOne(accountEntity.CollectionName, {_id: this.newComment.ownerId}, (err, res: accountEntity.AccountEntity)=>{
            var mappedComment;
            if (!err){
                mappedComment = this.mapComment(this.newComment);
                mappedComment.ownerLogo = res.logo;
                mappedComment.ownerName = res.name;
                mappedComment.ownerType = res.type;
            }

            next(err, mappedComment);
        });
    };

    private mapComment(comment: commentEntity.CommentEntity){
        var mappedComment: IComment = {
            id: comment._id.toString(),
            text: comment.text,
            ownerId: comment.ownerId.toString(),
            ownerName: null,
            ownerLogo: null,
            ownerType: null,
            date: comment.updatedOn,
            isPawed: true,
            paws: 1,
            parentCommentId: comment.parentCommentId ? comment.parentCommentId.toString() : null,
            replies: 0
        };

        return mappedComment;
    }

    private respond(cb: (response: ISavePostCommentResponse) => void, err, comment: IComment) {
        var response: ISavePostCommentResponse = {
            error: err,
            comment: comment
        };

        cb(response);
    }
}