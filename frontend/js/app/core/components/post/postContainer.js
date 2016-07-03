define(["require", "exports", 'knockout', '../../../core/services/services', '../../../routes', 'lodash'], function (require, exports, ko, services, routes, _) {
    var PostContainer = (function () {
        function PostContainer() {
            var _this = this;
            this.comment = ko.observable('');
            this.comments = ko.observableArray([]);
            this.hasMoreComments = ko.observable(false);
            this.reply = ko.observable('');
            this.hasMoreReplies = ko.observable(false);
            this.postContainerSelector = '.post-container';
            this.togglePostPaw = function (post, evt) {
                var request = { postId: post.id };
                services.server.post(routes.post.togglePostPaw, request).then(function (response) {
                    post.isPawed(response.isPawSet);
                    var pawDifference = response.isPawSet ? 1 : -1;
                    post.paws(post.paws() + pawDifference);
                    services.ui.animatePaw(evt, response.isPawSet);
                });
            };
            this.toggleCommentsSection = function (post, evt) {
                var target = evt ? window.getTarget(evt) : null;
                _this.toggleComments(post, target);
            };
            this.saveComment = function (post, evt) {
                if (!_this.comment()) {
                    return;
                }
                var request = { postId: post.id, text: _this.comment() };
                _this.comment('');
                services.server.post(routes.post.saveComment, request).then(function (response) {
                    _this.saveCommentCb(response);
                });
            };
            this.showMoreComments = function (post, evt) {
                var commentCount = _.filter(_this.comments(), function (x) { return !x.isReply && !x.isNewlyAdded; }).length;
                _this.getComments(post, commentCount);
            };
            this.toggleCommentPaw = function (comment, evt) {
                var request = { postId: _this.openCommentsPost.id, commentId: comment.id };
                services.server.post(routes.post.togglePostCommentPaw, request).then(function (response) {
                    comment.isPawed(response.isPawSet);
                    var pawDifference = response.isPawSet ? 1 : -1;
                    comment.paws(comment.paws() + pawDifference);
                    comment.isPawed(response.isPawSet);
                });
            };
            this.toggleCommentReplySection = function (comment, evt) {
                var target = window.getTarget(evt);
                _this.toggleReplies(comment, target);
            };
            this.hideCommentReplySection = function (comment, evt) {
                var target = window.getTarget(evt);
                var parentComment = _this.getParentComment(target);
                _this.toggleReplies(_this.commentToReply, parentComment);
            };
            this.saveCommentReply = function (comment, evt) {
                if (!_this.reply()) {
                    return;
                }
                var request = {
                    postId: _this.openCommentsPost.id,
                    text: _this.reply(),
                    parentCommentId: _this.commentToReply.id
                };
                _this.reply('');
                _this.closeReplyInputForReply(comment);
                services.server.post(routes.post.saveComment, request).then(function (response) {
                    _this.saveReplyCb(response);
                });
            };
            this.goToReply = function (comment, evt) {
                var target = window.getTarget(evt);
                var parentComment = _this.getParentComment(target);
                services.ui.scrollWhenCollapse(parentComment);
            };
            this.showMoreReplies = function (comment, evt) {
                var replyCount = _.filter(_this.comments(), function (x) { return x.isReply && !x.isNewlyAdded; }).length;
                _this.getReplies(replyCount);
            };
            this.hideCommentsSection = function (post, evt) {
                var target = window.getTarget(evt);
                var postButtons = $(target).closest('.post').find('.post-buttons');
                _this.toggleComments(post, postButtons);
            };
            this.facebook = function (post, evt) {
                evt.preventDefault();
                var baseUrl = window.location.protocol + '//' + window.location.host;
                var link = baseUrl + '?post=' + post.id;
                var picture = post.coverUrl ? post.coverUrl : post.contentUrl;
                if (picture.indexOf('/uploads/') === 0) {
                    picture = baseUrl + picture;
                }
                window.FB.ui({
                    method: 'share',
                    href: post.facebookUrl,
                    display: 'popup'
                });
            };
            this.onVideoClick = function (evt) {
                var vid = window.getTarget(evt)[0];
                if (vid.paused) {
                    vid.play();
                }
                else {
                    vid.pause();
                }
            };
            this.onVideoCoverClick = function (evt) {
                var target = window.getTarget(evt);
                var parent = target.closest('.picture-container');
                var video = parent.find('video')[0];
                if (video.readyState != 4) {
                    video.load();
                }
                video.play();
                $(video).show();
                parent.find('.cover-container').hide();
            };
            this.onScrollStopStartVideo = function () {
                var videos = $(_this.postContainerSelector + ' video');
                _.each(videos, function (video) {
                    var rect = video.getBoundingClientRect();
                    var visible = rect.top >= -rect.height + 50 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + rect.height - 50;
                    if (visible) {
                    }
                    else {
                        if (!video.paused) {
                            video.pause();
                            $(video).hide();
                            var parent = $(video).closest('.picture-container');
                            parent.find('.cover-container').show();
                        }
                    }
                });
            };
            this.onOwnerClick = function (evt) {
                var el = window.getTarget(evt)[0];
                var data = ko.dataFor(el);
                services.nav.goToUrl('#posts/' + data.ownerId);
            };
            this.onPostClick = function (evt) {
                var el = window.getTarget(evt)[0];
                var data = ko.dataFor(el);
                services.nav.goToUrl('#post/' + data.id);
            };
        }
        PostContainer.prototype.bindEvents = function () {
            this.bindVideo();
            this.bindOwnerClick();
            this.bindPostClick();
            this.bindCommentOwnerClick();
        };
        PostContainer.prototype.unbindEvents = function () {
            this.unbindVideo();
            this.unbindOwnerClick();
            this.unbindPostClick();
            this.unbindCommentOwnerClick();
        };
        PostContainer.prototype.toggleComments = function (post, postButtonsEl) {
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
        };
        PostContainer.prototype.getParentComment = function (elInsideReply) {
            return elInsideReply.closest('li').prevAll('.comment-type-comment').first();
        };
        PostContainer.prototype.closeReplyInputForReply = function (comment) {
            if (comment.isReply) {
                comment.isReplyOpen(false);
            }
        };
        PostContainer.prototype.toggleReplies = function (comment, commentEl) {
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
            }
            else {
                this.removeReplies();
            }
            services.ui.scrollWhenCollapse(commentEl);
        };
        PostContainer.prototype.removeReplies = function () {
            var firstReplyNr = _.findIndex(this.comments(), function (x) { return x.isReply; });
            if (firstReplyNr > -1) {
                var lastReplyNr = _.findLastIndex(this.comments(), function (x) { return x.isReply; });
                this.comments.splice(firstReplyNr, lastReplyNr - firstReplyNr + 1);
            }
        };
        PostContainer.prototype.getReplies = function (skip) {
            var _this = this;
            var request = {
                postId: this.openCommentsPost.id,
                commentId: this.commentToReply.id,
                skip: skip
            };
            services.server.get(routes.post.getComments, request).then(function (response) {
                var replies = _this.mapComments(response.comments);
                _this.setLastReply(replies);
                _this.fillReplies(replies);
                _this.updateHasMoreReplies(response.totalCount);
            });
        };
        PostContainer.prototype.fillReplies = function (replies) {
            var index = this.getReplyAdditionIndex();
            var args = [index, 0];
            args = args.concat(replies);
            this.comments.splice.apply(this.comments, args);
        };
        PostContainer.prototype.setLastReply = function (replies) {
            var lastReply = _.filter(this.comments(), function (x) { return x.isLastReply(); })[0];
            if (lastReply) {
                lastReply.isLastReply(false);
            }
            if (replies.length > 0) {
                replies[replies.length - 1].isLastReply(true);
            }
        };
        PostContainer.prototype.getReplyAdditionIndex = function () {
            var _this = this;
            return _.findLastIndex(this.comments(), function (x) { return x.isReply || x.id === _this.commentToReply.id; }) + 1;
        };
        PostContainer.prototype.updateHasMoreReplies = function (totalReplyCount) {
            var replyCount = _.filter(this.comments(), function (x) { return x.isReply; }).length;
            this.hasMoreReplies(replyCount < totalReplyCount);
        };
        PostContainer.prototype.saveReplyCb = function (response) {
            var addedReply = new Comment(response.comment);
            addedReply.isNewlyAdded = true;
            var commentNr = this.comments.indexOf(this.commentToReply);
            this.comments.splice(commentNr + 1, 0, addedReply);
            this.commentToReply.replies(this.commentToReply.replies() + 1);
            this.openCommentsPost.commentAdded();
        };
        PostContainer.prototype.saveCommentCb = function (response) {
            var addedComment = new Comment(response.comment);
            addedComment.isNewlyAdded = true;
            this.comments.splice(0, 0, addedComment);
            this.openCommentsPost.commentAdded();
        };
        PostContainer.prototype.getComments = function (post, skip) {
            var _this = this;
            var request = {
                postId: post.id,
                skip: skip
            };
            services.server.get(routes.post.getComments, request).then(function (response) {
                var comments = _this.mapComments(response.comments);
                _this.comments.pushAll(comments);
                _this.hasMoreComments(_this.comments().length < response.totalCount);
            });
        };
        PostContainer.prototype.mapComments = function (comments) {
            var result = [];
            for (var i = 0; i < comments.length; i++) {
                var comment = comments[i];
                var mappedComment = new Comment(comment);
                result.push(mappedComment);
            }
            return result;
        };
        PostContainer.prototype.bindVideo = function () {
            $(window).on('scroll', this.onScrollStopStartVideo);
            $(this.postContainerSelector).on('click', 'video', this.onVideoClick);
            $(this.postContainerSelector).on('click', '.cover-container', this.onVideoCoverClick);
        };
        PostContainer.prototype.unbindVideo = function () {
            $(window).off('scroll', this.onScrollStopStartVideo);
            $(this.postContainerSelector).off('click', 'video', this.onVideoClick);
            $(this.postContainerSelector).off('click', '.cover-container', this.onVideoCoverClick);
        };
        PostContainer.prototype.bindOwnerClick = function () {
            $(this.postContainerSelector).on('click', '.post-owner', this.onOwnerClick);
        };
        PostContainer.prototype.unbindOwnerClick = function () {
            $(this.postContainerSelector).off('click', '.post-owner', this.onOwnerClick);
        };
        PostContainer.prototype.bindPostClick = function () {
            $(this.postContainerSelector).on('click', '.post-title', this.onPostClick);
            $(this.postContainerSelector).on('click', '.post-picture', this.onPostClick);
        };
        PostContainer.prototype.unbindPostClick = function () {
            $(this.postContainerSelector).off('click', '.post-title', this.onPostClick);
            $(this.postContainerSelector).off('click', '.post-picture', this.onPostClick);
        };
        PostContainer.prototype.bindCommentOwnerClick = function () {
            $(this.postContainerSelector).on('click', '.comment-owner-logo', this.onCommentOnwerClick);
        };
        PostContainer.prototype.unbindCommentOwnerClick = function () {
            $(this.postContainerSelector).off('click', '.comment-owner-logo', this.onCommentOnwerClick);
        };
        PostContainer.prototype.onCommentOnwerClick = function (evt) {
            var el = window.getTarget(evt)[0];
            var data = ko.dataFor(el);
            services.nav.goToUrl('#posts/' + data.ownerId);
        };
        return PostContainer;
    })();
    exports.PostContainer = PostContainer;
    var Post = (function () {
        function Post(dto) {
            this.paws = ko.observable(0);
            this.isPawed = ko.observable(false);
            this.comments = ko.observable(0);
            this.isCommentsOpen = ko.observable(false);
            this.unreadComments = ko.observable(0);
            this.unviewedPaws = ko.observable(0);
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
            if (this.type == 3 /* Video */) {
                this.coverUrl = this.contentUrl.substr(0, this.contentUrl.lastIndexOf('.')) + '.jpeg';
            }
            this.date = services.util.getTimeAgo(dto.createdOn);
            this.facebookUrl = this.getFacebookUrl(this.id);
            this.unreadComments(dto.unreadComments);
            this.unviewedPaws(dto.unviewedPaws);
        }
        Post.prototype.formatTopComment = function (ownerName, comment) {
            return ownerName && comment ? ownerName + ': ' + comment : null;
        };
        Post.prototype.commentAdded = function () {
            var count = this.comments() + 1;
            this.comments(count);
        };
        Post.prototype.postOpened = function (commentButton) {
            if (!this.unreadComments() && !this.unviewedPaws()) {
                return;
            }
            var badges = commentButton.closest('.post').find('.post-buttons .unread-comments');
            services.ui.animateBadges(badges);
            this.unreadComments(0);
            this.unviewedPaws(0);
        };
        Post.prototype.getFacebookUrl = function (postId) {
            var baseUrl = window.location.protocol + '//' + window.location.host;
            var url = baseUrl + '?post=' + postId + '&ref=fb';
            return 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
        };
        return Post;
    })();
    exports.Post = Post;
    var Comment = (function () {
        function Comment(dto) {
            this.paws = ko.observable(0);
            this.isPawed = ko.observable(false);
            this.isReplyOpen = ko.observable(false);
            this.replies = ko.observable(0);
            this.isLastReply = ko.observable(false);
            this.isNewlyAdded = false;
            this.id = dto.id;
            this.text = dto.text;
            this.ownerName = dto.ownerName;
            this.ownerLogo = dto.ownerLogo;
            this.paws(dto.paws);
            this.isPawed(dto.isPawed);
            this.date = services.util.getTimeAgo(dto.date);
            this.isReply = dto.parentCommentId != null;
            this.replies(dto.replies);
            this.petTypeClass = services.ui.getClassForPetType(dto.ownerType);
            this.ownerId = dto.ownerId;
        }
        return Comment;
    })();
    exports.Comment = Comment;
});
//# sourceMappingURL=postContainer.js.map