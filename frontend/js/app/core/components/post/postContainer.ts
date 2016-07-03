/// <reference path='../../../../typings/refs.d.ts' />
import ko = require('knockout');
import services = require('../../../core/services/services');
import router = require('plugins/router');
import routes = require('../../../routes');
import _ = require('lodash');

export class PostContainer {
    comment = ko.observable('');
    comments = ko.observableArray<Comment>([]);
    openCommentsPost: Post;
    hasMoreComments = ko.observable(false);
    commentToReply:Comment;
    reply = ko.observable('');
    hasMoreReplies = ko.observable(false);

    protected postContainerSelector = '.post-container';

    constructor() {
    }

    protected bindEvents(){
        this.bindVideo();
        this.bindOwnerClick();
        this.bindPostClick();
        this.bindCommentOwnerClick();
    }

    protected unbindEvents(){
        this.unbindVideo();
        this.unbindOwnerClick();
        this.unbindPostClick();
        this.unbindCommentOwnerClick();
    }

    togglePostPaw = (post:Post, evt) => {
        var request:ITogglePostPawRequest = {postId: post.id};
        services.server.post(routes.post.togglePostPaw, request).then((response:ITogglePostPawResponse) => {
            post.isPawed(response.isPawSet);

            var pawDifference = response.isPawSet ? 1 : -1;
            post.paws(post.paws() + pawDifference);

            services.ui.animatePaw(evt, response.isPawSet);
        });
    };

    toggleCommentsSection = (post:Post, evt?: any) => {
        var target = evt ? window.getTarget(evt) : null;
        this.toggleComments(post, target);
    };

    saveComment = (post:Post, evt) => {
        if (!this.comment()) {
            return;
        }
        var request:ISavePostCommentRequest = {postId: post.id, text: this.comment()};
        this.comment('');

        services.server.post(routes.post.saveComment, request).then((response:ISavePostCommentResponse) => {
            this.saveCommentCb(response);
        });
    };

    showMoreComments = (post:Post, evt) => {
        var commentCount = _.filter(this.comments(), x => !x.isReply && !x.isNewlyAdded).length;
        this.getComments(post, commentCount);
    };

    toggleCommentPaw = (comment:Comment, evt) => {
        var request:ITogglePostCommentPawRequest = {postId: this.openCommentsPost.id, commentId: comment.id};
        services.server.post(routes.post.togglePostCommentPaw, request).then((response:ITogglePostPawResponse) => {
            comment.isPawed(response.isPawSet);

            var pawDifference = response.isPawSet ? 1 : -1;
            comment.paws(comment.paws() + pawDifference);
            comment.isPawed(response.isPawSet);
        });
    };

    toggleCommentReplySection = (comment:Comment, evt) => {
        var target = window.getTarget(evt);
        this.toggleReplies(comment, target);
    };

    hideCommentReplySection = (comment:Comment, evt) => {
        var target = window.getTarget(evt);
        var parentComment = this.getParentComment(target);
        this.toggleReplies(this.commentToReply, parentComment);
    };

    saveCommentReply = (comment:Comment, evt) => {
        if (!this.reply()) {
            return;
        }
        var request:ISavePostCommentRequest = {
            postId: this.openCommentsPost.id,
            text: this.reply(),
            parentCommentId: this.commentToReply.id
        };
        this.reply('');
        this.closeReplyInputForReply(comment);

        services.server.post(routes.post.saveComment, request).then((response:ISavePostCommentResponse) => {
            this.saveReplyCb(response);
        });
    };

    goToReply = (comment:Comment, evt) => {
        var target = window.getTarget(evt);
        var parentComment = this.getParentComment(target);
        services.ui.scrollWhenCollapse(parentComment);
    };

    showMoreReplies = (comment:Comment, evt) => {
        var replyCount = _.filter(this.comments(), x => x.isReply && !x.isNewlyAdded).length;
        this.getReplies(replyCount);
    };

    hideCommentsSection = (post:Post, evt) => {
        var target = window.getTarget(evt);
        var postButtons = $(target).closest('.post').find('.post-buttons');
        this.toggleComments(post, postButtons);
    };

    facebook = (post: Post, evt) => {
        evt.preventDefault();
        var baseUrl = window.location.protocol + '//' + window.location.host;       // Does not work with localhost so hardcoding it
        //var link = baseUrl + '/#post/' + post.id;
        var link = baseUrl + '?post=' + post.id;
        var picture = post.coverUrl ? post.coverUrl : post.contentUrl;
        if (picture.indexOf('/uploads/') === 0){
            picture = baseUrl + picture;
        }
        window.FB.ui(
            {
                method: 'share',
                href: post.facebookUrl,
                display: 'popup'
                //picture: picture,
                //caption: 'UnrealPet.com',
                //description: post.title + ' | ' + window.mltId.facebook_share_description
            });
    };

    toggleComments(post:Post, postButtonsEl: JQuery) {
        var show = !post.isCommentsOpen();
        post.isCommentsOpen(show);

        if (show && (!this.openCommentsPost || this.openCommentsPost.id != post.id)) {
            if (this.openCommentsPost) {
                this.openCommentsPost.isCommentsOpen(false);
            }
            this.openCommentsPost = post;
            this.comments([]);
            this.hasMoreComments(false);
            this.getComments(post);
            post.postOpened(postButtonsEl);
        }

        if (postButtonsEl) {
            services.ui.scrollWhenCollapse(postButtonsEl);
        }
    }

    private getParentComment(elInsideReply:JQuery) {
        return elInsideReply.closest('li').prevAll('.comment-type-comment').first();
    }

    private closeReplyInputForReply(comment:Comment) {
        if (comment.isReply) {
            comment.isReplyOpen(false);
        }
    }

    private toggleReplies(comment:Comment, commentEl:JQuery) {
        var show = !comment.isReplyOpen();
        comment.isReplyOpen(show);

        if (show) {
            if (this.commentToReply && this.commentToReply.id !== comment.id) {
                this.commentToReply.isReplyOpen(false);
                this.removeReplies();
            }
            this.commentToReply = comment;
            this.reply('');

            this.getReplies();
        } else {
            this.removeReplies();
        }

        services.ui.scrollWhenCollapse(commentEl);
    }

    private removeReplies() {
        var firstReplyNr = _.findIndex(this.comments(), x => x.isReply);
        if (firstReplyNr > -1) {
            var lastReplyNr = _.findLastIndex(this.comments(), x => x.isReply);
            this.comments.splice(firstReplyNr, lastReplyNr - firstReplyNr + 1);
        }
    }

    private getReplies(skip?:number) {
        var request:IGetPostCommentsRequest = {
            postId: this.openCommentsPost.id,
            commentId: this.commentToReply.id,
            skip: skip
        };

        services.server.get(routes.post.getComments, request).then((response:IGetPostCommentsResopnse) => {
            var replies = this.mapComments(response.comments);
            this.setLastReply(replies);
            this.fillReplies(replies);
            this.updateHasMoreReplies(response.totalCount);
        });
    }

    private fillReplies(replies:Comment[]) {
        var index = this.getReplyAdditionIndex();
        var args:any[] = [index, 0];
        args = args.concat(replies);
        this.comments.splice.apply(this.comments, args);
    }

    private setLastReply(replies:Comment[]) {
        var lastReply = _.filter(this.comments(), x => x.isLastReply())[0];
        if (lastReply) {
            lastReply.isLastReply(false);
        }

        if(replies.length > 0){
            replies[replies.length - 1].isLastReply(true);
        }
    }

    private getReplyAdditionIndex():number {
        return _.findLastIndex(this.comments(), x => x.isReply || x.id === this.commentToReply.id) + 1;
    }

    private updateHasMoreReplies(totalReplyCount) {
        var replyCount = _.filter(this.comments(), x => x.isReply).length;
        this.hasMoreReplies(replyCount < totalReplyCount);
    }

    private saveReplyCb(response:ISavePostCommentResponse) {
        var addedReply = new Comment(response.comment);
        addedReply.isNewlyAdded = true;
        var commentNr = this.comments.indexOf(this.commentToReply);
        this.comments.splice(commentNr + 1, 0, addedReply);
        this.commentToReply.replies(this.commentToReply.replies() + 1);
        this.openCommentsPost.commentAdded();
    }

    private saveCommentCb(response:ISavePostCommentResponse) {
        var addedComment = new Comment(response.comment);
        addedComment.isNewlyAdded = true;
        this.comments.splice(0, 0, addedComment);
        this.openCommentsPost.commentAdded();
    }

    private getComments(post:Post, skip?:number) {
        var request:IGetPostCommentsRequest = {
            postId: post.id,
            skip: skip
        };
        services.server.get(routes.post.getComments, request).then((response:IGetPostCommentsResopnse) => {
            var comments = this.mapComments(response.comments);
            this.comments.pushAll(comments);

            this.hasMoreComments(this.comments().length < response.totalCount);
        });
    }

    private mapComments(comments:Array<IComment>) {
        var result = [];
        for (var i = 0; i < comments.length; i++) {
            var comment = comments[i];
            var mappedComment = new Comment(comment);
            result.push(mappedComment);
        }

        return result;
    }

    private bindVideo() {
        $(window).on('scroll', this.onScrollStopStartVideo);
        $(this.postContainerSelector).on('click', 'video', this.onVideoClick);
        $(this.postContainerSelector).on('click', '.cover-container', this.onVideoCoverClick);
    }

    private unbindVideo() {
        $(window).off('scroll', this.onScrollStopStartVideo);
        $(this.postContainerSelector).off('click', 'video', this.onVideoClick);
        $(this.postContainerSelector).off('click', '.cover-container', this.onVideoCoverClick);
    }

    private onVideoClick = (evt) => {
        var vid: HTMLVideoElement = <any>window.getTarget(evt)[0];
        if (vid.paused){
            vid.play();
        }
        else{
            vid.pause();
        }
    };

    private onVideoCoverClick = (evt) => {
        var target = window.getTarget(evt);
        var parent = target.closest('.picture-container');
        var video: HTMLVideoElement = <any>parent.find('video')[0];

        if (video.readyState != 4){
            video.load();
        }

        video.play();
        $(video).show();

        parent.find('.cover-container').hide();
    };

    protected onScrollStopStartVideo = () => {
        var videos = $(this.postContainerSelector + ' video');
        _.each(videos, (video: HTMLVideoElement) => {
            var rect = video.getBoundingClientRect();
            var visible = rect.top >= -rect.height + 50 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + rect.height - 50;
            if (visible){
                //if (video.paused){
                //    video.play();
                //}
            }
            else{
                if (!video.paused){
                    video.pause();
                    $(video).hide();
                    var parent = $(video).closest('.picture-container');
                    parent.find('.cover-container').show();
                }
            }
        });
    };

    private bindOwnerClick() {
        $(this.postContainerSelector).on('click', '.post-owner', this.onOwnerClick);
    }

    private unbindOwnerClick() {
        $(this.postContainerSelector).off('click', '.post-owner', this.onOwnerClick);
    }

    private onOwnerClick = (evt) => {
        var el = window.getTarget(evt)[0];
        var data: Post = ko.dataFor(el);

        services.nav.goToUrl('#posts/' + data.ownerId);
    };

    private bindPostClick() {
        $(this.postContainerSelector).on('click', '.post-title', this.onPostClick);
        $(this.postContainerSelector).on('click', '.post-picture', this.onPostClick);
    }

    private unbindPostClick() {
        $(this.postContainerSelector).off('click', '.post-title', this.onPostClick);
        $(this.postContainerSelector).off('click', '.post-picture', this.onPostClick);
    }

    private onPostClick = (evt) => {
        var el = window.getTarget(evt)[0];
        var data: Post = ko.dataFor(el);

        services.nav.goToUrl('#post/' + data.id);
    };

    private bindCommentOwnerClick(){
        $(this.postContainerSelector).on('click', '.comment-owner-logo', this.onCommentOnwerClick);
    }

    private unbindCommentOwnerClick(){
        $(this.postContainerSelector).off('click', '.comment-owner-logo', this.onCommentOnwerClick);
    }

    private onCommentOnwerClick(evt){
        var el = window.getTarget(evt)[0];
        var data: Comment = ko.dataFor(el);

        services.nav.goToUrl('#posts/' + data.ownerId);
    }
}

export class Post {
    id: string;
    title: string;
    contentUrl: string;
    ownerId: string;
    ownerName: string;
    ownerLogo: string;
    petTypeClass: string;
    paws = ko.observable(0);
    isPawed = ko.observable(false);
    comments = ko.observable(0);
    isCommentsOpen = ko.observable(false);
    topComment: string;
    favs: number;
    type: PostContentType;
    coverUrl: string;
    date: string;
    facebookUrl: string;
    unreadComments = ko.observable(0);
    unviewedPaws = ko.observable(0);

    constructor(dto: IPost){
        this.id = dto.id;
        this.title = dto.title;
        this.contentUrl = dto.contentUrl;
        this.ownerId = dto.ownerId;
        this.ownerName = dto.ownerName;
        this.ownerLogo = dto.ownerLogo ? dto.ownerLogo : '';
        this.paws(dto.paws);
        this.isPawed(dto.isPawed);
        this.comments(dto.comments);
        this.topComment = this.formatTopComment(dto.topCommentOwnerName, dto.topComment);
        this.favs = dto.favs;
        this.petTypeClass = services.ui.getClassForPetType(dto.ownerType);
        this.type = dto.contentType;
        if (this.type == PostContentType.Video){
            this.coverUrl = this.contentUrl.substr(0, this.contentUrl.lastIndexOf('.')) + '.jpeg';
        }
        this.date = services.util.getTimeAgo(dto.createdOn);
        this.facebookUrl = this.getFacebookUrl(this.id);
        this.unreadComments(dto.unreadComments);
        this.unviewedPaws(dto.unviewedPaws);
    }

    private formatTopComment(ownerName, comment){
        return ownerName && comment
            ? ownerName + ': ' + comment
            : null;
    }

    commentAdded(){
        var count = this.comments() + 1;
        this.comments(count);
    }

    postOpened(commentButton: JQuery) {
        if (!this.unreadComments() && !this.unviewedPaws()){
            return;
        }

        var badges = commentButton.closest('.post').find('.post-buttons .unread-comments');
        services.ui.animateBadges(badges);
        this.unreadComments(0);
        this.unviewedPaws(0);
    }

    private getFacebookUrl(postId: string){
        var baseUrl = window.location.protocol + '//' + window.location.host;
        var url = baseUrl + '?post=' + postId + '&ref=fb';
        return 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
    }
}

export class Comment {
    id: string;
    text: string;
    ownerName: string;
    ownerLogo: string;
    ownerId: string;
    petTypeClass: string;
    date: string;
    isReply: boolean;
    paws = ko.observable(0);
    isPawed = ko.observable(false);
    isReplyOpen = ko.observable(false);
    replies = ko.observable(0);
    isLastReply = ko.observable(false);
    isNewlyAdded = false;

    constructor(dto: IComment){
        this.id = dto.id;
        this.text = dto.text;
        this.ownerName = dto.ownerName;
        this.ownerLogo = dto.ownerLogo;
        this.paws(dto.paws);
        this.isPawed(dto.isPawed);
        this.date = services.util.getTimeAgo(<any>dto.date);
        this.isReply = dto.parentCommentId != null;
        this.replies(dto.replies);
        this.petTypeClass = services.ui.getClassForPetType(dto.ownerType);
        this.ownerId = dto.ownerId;
    }
}