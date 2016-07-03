var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'knockout', '../../../core/services/services', '../base/component', '../post/postContainer'], function (require, exports, ko, services, component, postContainer) {
    var PostSearchGrid = (function (_super) {
        __extends(PostSearchGrid, _super);
        function PostSearchGrid() {
            _super.apply(this, arguments);
            this.name = 'post-search-grid';
            this.createViewModel = function () {
                return new PostSearchGridModel();
            };
            this.template = { require: this.getBaseTemplatePath() + '/postSearchGrid/postSearchGrid.html' };
        }
        return PostSearchGrid;
    })(component.Component);
    exports.PostSearchGrid = PostSearchGrid;
    var PostSearchGridModel = (function (_super) {
        __extends(PostSearchGridModel, _super);
        function PostSearchGridModel() {
            _super.call(this);
            this.posts = ko.observableArray([]);
            this.postPageSize = 15;
            this.isGetPostsInProgress = false;
            this.hasMorePosts = true;
        }
        PostSearchGridModel.prototype.init = function (options, element) {
            this.options = options;
            this.options.component = this;
            if (!this.options.manualStart) {
                this.initialize();
            }
            if (this.options.onInit) {
                this.options.onInit();
            }
        };
        PostSearchGridModel.prototype.start = function () {
            this.initialize();
        };
        PostSearchGridModel.prototype.initialize = function () {
            this.getPosts();
            this.bindScroll();
            this.bindEvents();
        };
        PostSearchGridModel.prototype.destroy = function () {
            this.unbindScroll();
            this.unbindEvents();
        };
        PostSearchGridModel.prototype.getPosts = function () {
            var _this = this;
            if (this.isGetPostsInProgress || !this.hasMorePosts) {
                return;
            }
            this.isGetPostsInProgress = true;
            var request = {
                skip: this.posts().length,
                take: this.postPageSize
            };
            var customReq = this.options.getRequest ? this.options.getRequest() : null;
            if (customReq) {
                request = $.extend(request, customReq);
            }
            services.server.get(this.options.url, request).then(function (response) {
                _this.getCb(response);
                _this.isGetPostsInProgress = false;
                _this.hasMorePosts = response.list && response.list.length !== 0;
            });
        };
        PostSearchGridModel.prototype.getCb = function (response) {
            if (response.error) {
                this.handleErrorResponse(response);
            }
            else {
                var retrievedPosts = this.mapPosts(response.list);
                var posts = this.posts();
                var result = posts.concat(retrievedPosts);
                this.posts(result);
                this.onScrollStopStartVideo();
            }
        };
        PostSearchGridModel.prototype.handleErrorResponse = function (response) {
            var onError = this.options.onRequestError;
            if (onError) {
                onError(response);
            }
            else {
                services.ui.showAlert({
                    msg: response.error,
                    type: 3 /* Danger */
                });
            }
        };
        PostSearchGridModel.prototype.mapPosts = function (posts) {
            var result = [];
            for (var i = 0; i < posts.length; i++) {
                var post = posts[i];
                var mappedPost = new postContainer.Post(post);
                result.push(mappedPost);
            }
            return result;
        };
        PostSearchGridModel.prototype.bindScroll = function () {
            var _this = this;
            var lastPost = function () {
                return $(_this.postContainerSelector + ' .post:last');
            };
            var cb = function () {
                _this.getPosts();
            };
            this.scrollSubscriberId = services.ui.onScrollVisibleBottom(lastPost, cb);
        };
        PostSearchGridModel.prototype.unbindScroll = function () {
            services.ui.offScrollVisibleBottom(this.scrollSubscriberId);
        };
        return PostSearchGridModel;
    })(postContainer.PostContainer);
});
//# sourceMappingURL=postSearchGrid.js.map