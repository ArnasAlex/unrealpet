/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import postEntity = require('../../entities/postEntity');
import activityEntity = require('../../entities/activityEntity');
import accountEntity = require('../../entities/accountEntity');
import commentEntity = require('../../entities/commentEntity');

export class GetPostCommentsOperation extends operation.Operation {
    protected request: IGetPostCommentsRequest;
    private static pageSize = 10;
    private post: postEntity.PostEntity;
    private comments: commentEntity.CommentEntity[];
    private allComments: commentEntity.CommentEntity[];
    private totalCount: number;
    private accounts: accountEntity.AccountEntity[];

    public execute(cb: (response: IGetPostCommentsResopnse) => void) {
        this.async.waterfall([
                this.getPost,
                this.updateOwnerViewedOn,
                this.clearRecentActivities,
                this.getComments,
                this.getRelatedAccounts,
                this.map
            ],
            this.respond.bind(this, cb));
    }

    private getPost = (next) => {
        var postId = this.getObjectId(this.request.postId);
        this.findOne(postEntity.CollectionName, {_id: postId}, (err, res) => {
            this.post = res;
            next(err);
        });
    };

    private updateOwnerViewedOn = (next) => {
        if (this.currentUserId() === this.post.ownerId.toString()){
            var query = {_id: this.post._id};
            var update = { $set: {ownerViewedOn: new Date()}};
            this.db.collection(postEntity.CollectionName).update(query, update, (err, res) => {
                if (err){
                    this.logDbError('Error on updating ownerViewedOn: ' + err);
                }
            });
        }

        next(null);
    };

    private clearRecentActivities = (next) => {
        var query = {
            accountId: this.currentUserObjectId(),
            relatedId: this.post._id
        };
        this.remove(activityEntity.CollectionName, query, () => {});

        next(null);
    };

    private getComments = (next) => {
        var comments = this.post.comments;
        this.totalCount = 0;
        if (comments && comments.length > 0){
            comments = this.getCommentsAccordingToRequest(comments);
            this.totalCount = comments.length;

            comments = this.sortComments(comments);
            comments = this.getPageOfComments(comments);
        }

        if (!comments){
            comments = [];
        }

        this.comments = comments;
        this.allComments = this.post.comments;

        next(null);
    };

    private getPageOfComments(comments: commentEntity.CommentEntity[]){
        var skip = this.getNumberFromGetRequest(this.request.skip);
        var pageSize = GetPostCommentsOperation.pageSize;

        var result = comments.slice(skip, skip + pageSize);
        return result;
    }

    private getCommentsAccordingToRequest(comments: commentEntity.CommentEntity[]){
        var result;
        if (!this.request.commentId){
            result = this.removeReplies(comments);
        }
        else{
            result = this.getReplies(comments, this.request.commentId);
        }

        return result;
    }

    private getReplies(comments: commentEntity.CommentEntity[], parentCommentId: string){
        var repliesForComment = this._.filter(comments, x =>
            x.parentCommentId &&
            x.parentCommentId.toString() === parentCommentId);

        return repliesForComment;
    }

    private removeReplies(comments: commentEntity.CommentEntity[]){
        var comments = this._.filter(comments, x => !x.parentCommentId);
        return comments;
    }

    private sortComments(comments: commentEntity.CommentEntity[]){
        return comments.sort((a, b) => {
            var result = 0;
            if (this.anyCommentsHasPaws(a, b)){
                result = this.compareCommentsByHasPaws(a, b);

                if (result === 0){
                    result = this.compareCommentsByPaws(a, b);
                }
            }

            if (result === 0){
                result = this.compareCommentsByDate(a, b);
            }

            return result;
        });
    }

    private compareCommentsByDate(a: commentEntity.CommentEntity, b:commentEntity.CommentEntity) {
        var aDate = a.createdOn.getTime();
        var bDate = b.createdOn.getTime();
        return aDate < bDate
            ? -1
            : aDate > bDate
                ? 1
                : 0;
    }

    private anyCommentsHasPaws(a: commentEntity.CommentEntity, b:commentEntity.CommentEntity) {
        return this.hasPaws(a) || this.hasPaws(b);
    }

    private compareCommentsByHasPaws(a: commentEntity.CommentEntity, b:commentEntity.CommentEntity) {
        var result = 0;
        if (this.hasPaws(a) && !this.hasPaws(b)){
            result = -1;
        }
        else if (!this.hasPaws(a) && this.hasPaws(b)){
            result = 1;
        }

        return result;
    }

    private compareCommentsByPaws(a: commentEntity.CommentEntity, b:commentEntity.CommentEntity){
        return a.paws.length > b.paws.length
            ? -1
            : a.paws.length < b.paws.length
                ? 1
                : 0;
    }

    private hasPaws(comment: commentEntity.CommentEntity){
        return comment.paws && comment.paws.length > 0;
    }

    private getRelatedAccounts = (next) => {
        var ownerIds = this.getOwnerIds(this.comments);

        this.db.collection(accountEntity.CollectionName).find({_id: {$in: ownerIds}}).toArray((err: any, res) => {
            if (err){
                this.logDbError('Error on find. Collection: ' + accountEntity.CollectionName + ', error: ' + err + '');
                err = this.defaultErrorMsg();
                next(err);
            }
            else {
                this.accounts = res;
                next(err);
            }
        });
    };

    private getOwnerIds(comments: Array<commentEntity.CommentEntity>){
        var ownerIds = [];
        for (var i = 0; i < comments.length; i++){
            var ownerId = comments[i].ownerId;
            if (ownerIds.indexOf(ownerId) === -1) {
                ownerIds.push(comments[i].ownerId);
            }
        }

        return ownerIds;
    }

    private map = (next) => {
        var result: Array<IComment> = [];
        if (this.comments.length > 0) {
            for (var i = 0; i < this.comments.length; i++) {
                var entity = this.comments[i];
                var comment: IComment = {
                    id: entity._id.toString(),
                    text: entity.text,
                    ownerId: entity.ownerId.toString(),
                    ownerName: null,
                    ownerLogo: null,
                    ownerType: null,
                    date: entity.updatedOn,
                    isPawed: this.getIsPawed(entity),
                    paws: this.getPawCount(entity),
                    parentCommentId: entity.parentCommentId ? entity.parentCommentId.toString(): null,
                    replies: this.getReplyCount(entity._id.toString(), this.allComments)
                };

                this.mapOwnerInfo(comment, this.accounts);
                result.push(comment);
            }
        }

        next(null, result);
    };

    private getReplyCount(commentId: string, allComments: Array<commentEntity.CommentEntity>){
        var replies = this._.filter(allComments,
                x => x.parentCommentId && x.parentCommentId.toString() === commentId
        );

        return replies.length;
    }

    private getPawCount(comment: commentEntity.CommentEntity){
        return comment.paws ? comment.paws.length : 0;
    }

    private getIsPawed(comment: commentEntity.CommentEntity){
        var result = false;
        if (this.currentUserId() && this.getPawCount(comment) > 0){
            result = this._.any(comment.paws, (paw) => {return paw.ownerId.toString() === this.currentUserId()});
        }

        return result;
    }

    private mapOwnerInfo(comment: IComment, owners: Array<accountEntity.AccountEntity>){
        var ownerId = this.getObjectId(comment.ownerId);
        var owner = this._.filter(owners, owner => owner._id.equals(ownerId))[0];
        comment.ownerName = owner.name;
        comment.ownerLogo = owner.logo;
        comment.ownerType = owner.type;
    }

    private respond(cb: (response: IGetPostCommentsResopnse) => void, err, comments: Array<IComment>) {
        var response = {error: err, comments: comments, totalCount: this.totalCount};
        cb(response);
    }
}