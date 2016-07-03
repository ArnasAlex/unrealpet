/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import postEntity = require('../../entities/postEntity');
import accountEntity = require('../../entities/accountEntity');
import commentEntity = require('../../entities/commentEntity');

export class SearchPostsOperation extends operation.Operation {
    protected request: ISearchPostsRequest;
    private monthInMs = 1000 * 60 * 60 * 24 * 30;

    public execute(cb: (response: ISearchPostsResponse) => void) {
        this.async.waterfall([
                this.getPosts.bind(this),
                this.getRelatedAccounts.bind(this),
                this.map.bind(this)
            ],
            this.respond.bind(this, cb));
    }

    private getPosts(next) {
        this.parseSearchRequest(this.request);
        var query = this.request.query;
        this.db.collection(postEntity.CollectionName)
            .find(query)
            .sort({createdOn: -1})
            .skip(this.request.skip)
            .limit(this.request.take)
            .toArray((err: any, res) => {
            if (err){
                this.logDbError('Error on find. Collection: ' + postEntity.CollectionName + ', error: ' + err + '');
                err = this.defaultErrorMsg();
                next(err);
            }
            else {
                next(err, res);
            }
        });
    }

    private getRelatedAccounts(posts: Array<postEntity.PostEntity>, next){
        var ownerIds = this.getOwnerIds(posts);
        var topCommentOwnerIds = this.getTopCommentsOwnerIds(posts);
        var accountIds = ownerIds.concat(topCommentOwnerIds);
        var uniqueAccountIds = this._.unique(accountIds);

        this.db.collection(accountEntity.CollectionName).find({_id: {$in: uniqueAccountIds}}).toArray((err: any, res) => {
            if (err){
                this.logDbError('Error on find. Collection: ' + accountEntity.CollectionName + ', error: ' + err + '');
                err = this.defaultErrorMsg();
                next(err);
            }
            else {
                next(err, posts, res);
            }
        });
    }

    private getTopCommentsOwnerIds(posts: Array<postEntity.PostEntity>){
        var ownerIds = [];
        for (var i = 0; i < posts.length; i++){
            var topComment = this.getTopComment(posts[i]);
            if (topComment){
                var ownerId = topComment.ownerId;
                if (ownerIds.indexOf(ownerId) === -1){
                    ownerIds.push(ownerId);
                }
            }
        }

        return ownerIds;
    }

    private getTopComment(post: postEntity.PostEntity): commentEntity.CommentEntity {
        var comments = post.comments;
        var topComment: commentEntity.CommentEntity = null;
        if (comments && comments.length > 0){
            for (var i = 0; i < comments.length; i++){
                if (!topComment ||
                    (!topComment.paws && comments[i].paws) ||
                    (comments[i].paws && topComment.paws && topComment.paws.length < comments[i].paws.length)){
                    topComment = comments[i];
                }
            }
        }

        return topComment;
    }

    private getOwnerIds(posts: Array<postEntity.PostEntity>){
        var ownerIds = [];
        for (var i = 0; i < posts.length; i++){
            var ownerId = posts[i].ownerId;
            if (ownerIds.indexOf(ownerId) === -1) {
                ownerIds.push(posts[i].ownerId);
            }
        }

        return ownerIds;
    }

    private map(posts: Array<postEntity.PostEntity>, owners: Array<accountEntity.AccountEntity>, next) {
        var result: Array<IPost> = [];
        for (var i = 0; i < posts.length; i++){
            var post: IPost = {
                id: posts[i]._id.toString(),
                title: posts[i].title,
                contentUrl: posts[i].pictureUrl,
                ownerId: posts[i].ownerId.toString(),
                ownerName: null,
                ownerLogo: null,
                ownerType: null,
                paws: this.getPawCount(posts[i]),
                isPawed: this.getIsPawed(posts[i]),
                comments: this.getCommentCount(posts[i]),
                topComment: null,
                topCommentOwnerName: null,
                favs: posts[i].favs,
                contentType: posts[i].pictureType,
                createdOn: <any>posts[i].createdOn,
                unreadComments: this.getUnreadComments(posts[i]),
                unviewedPaws: this.getUnviewedPaws(posts[i])
            };

            this.mapOwnerInfo(post, owners);
            this.mapTopComment(post, posts[i], owners);
            result.push(post);
        }

        next(null, result);
    }

    private getUnreadComments(post: postEntity.PostEntity){
        if (!this.request.accountId || this.request.accountId !== post.ownerId.toString()
            || ! post.comments || post.comments.length === 0){
            return 0;
        }

        if (post.updatedOn.getTime() < new Date().getTime() - this.monthInMs) {
            return 0;
        }

        var unreadComments = this._.filter(post.comments, (comment: commentEntity.CommentEntity) => {
            return comment.ownerId.toString() !== post.ownerId.toString() &&
                (!post.ownerViewedOn || comment.createdOn.getTime() > post.ownerViewedOn.getTime());
        });

        return unreadComments.length;
    }

    private getUnviewedPaws(post: postEntity.PostEntity){
        if (!this.request.accountId || this.request.accountId !== post.ownerId.toString()
            || ! post.paws || post.paws.length === 0){
            return 0;
        }

        if (post.updatedOn.getTime() < new Date().getTime() - this.monthInMs) {
            return 0;
        }

        var unviewedPaws = this._.filter(post.paws, (paw: postEntity.PawEntity) => {
            return paw.ownerId.toString() !== post.ownerId.toString()
                && (!post.ownerViewedOn || paw.createdOn.getTime() > post.ownerViewedOn.getTime());
        });

        return unviewedPaws.length;
    }

    private getCommentCount(post: postEntity.PostEntity){
        return post.comments ? post.comments.length : 0;
    }

    private getPawCount(post: postEntity.PostEntity){
        return post.paws ? post.paws.length : 0;
    }

    private getIsPawed(post: postEntity.PostEntity){
        var result = false;
        if (this.request.accountId && post.paws && post.paws.length > 0){
            result = this._.any(post.paws, (paw) => {return paw.ownerId.toString() === this.request.accountId});
        }

        return result;
    }

    private mapOwnerInfo(post: IPost, owners: Array<accountEntity.AccountEntity>){
        var ownerId = this.getObjectId(post.ownerId);
        var owner = this._.filter(owners, owner => owner._id.equals(ownerId))[0];
        post.ownerName = owner.name;
        post.ownerLogo = owner.logo;
        post.ownerType = owner.type;
    }

    private mapTopComment(post: IPost, entity: postEntity.PostEntity, owners: Array<accountEntity.AccountEntity>){
        var topComment = this.getTopComment(entity);
        if (topComment){
            var ownerId = topComment.ownerId;
            var owner: accountEntity.AccountEntity = this._.filter(owners, owner => owner._id.equals(ownerId))[0];
            post.topComment = topComment.text;
            post.topCommentOwnerName = owner.name;
        }
    }

    private respond(cb: (response: ISearchPostsResponse) => void, err, posts: Array<IPost>) {
        var response = {error: err, list: posts};
        cb(response);
    }
}

export interface ISearchPostsRequest extends IGetPostsRequest {
    query: any;
}
export interface ISearchPostsResponse extends IGetPostsResponse{}