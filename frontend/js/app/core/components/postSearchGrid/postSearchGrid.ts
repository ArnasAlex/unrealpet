/// <reference path='../../../../typings/refs.d.ts' />
import ko = require('knockout');
import services = require('../../../core/services/services');
import router = require('plugins/router');
import routes = require('../../../routes');
import _ = require('lodash');
import component = require('../base/component');
import postContainer = require('../post/postContainer');

export class PostSearchGrid extends component.Component {
    name = 'post-search-grid';
    createViewModel = () => { return new PostSearchGridModel(); };
    template = { require: this.getBaseTemplatePath() + '/postSearchGrid/postSearchGrid.html' }
}

class PostSearchGridModel extends postContainer.PostContainer implements Components.IComponentViewModel, Components.IPostSearchGrid {
    posts = ko.observableArray<postContainer.Post>([]);

    private postPageSize = 15;
    private isGetPostsInProgress = false;
    private hasMorePosts = true;
    private scrollSubscriberId: number;
    private options: Components.IPostSearchGridOptions;

    constructor() {
        super();
    }

    init(options: Components.IPostSearchGridOptions, element: JQuery){
        this.options = options;
        this.options.component = this;

        if (!this.options.manualStart){
            this.initialize();
        }

        if (this.options.onInit){
            this.options.onInit();
        }
    }

    start() {
        this.initialize();
    }

    private initialize(){
        this.getPosts();
        this.bindScroll();
        this.bindEvents();
    }

    destroy(){
        this.unbindScroll();
        this.unbindEvents();
    }

    private getPosts() {
        if (this.isGetPostsInProgress || !this.hasMorePosts) {
            return;
        }

        this.isGetPostsInProgress = true;
        var request:IGetPostsRequest = {
            skip: this.posts().length,
            take: this.postPageSize
        };

        var customReq = this.options.getRequest ? this.options.getRequest() : null;
        if (customReq){
            request = $.extend(request, customReq);
        }
        services.server.get(this.options.url, request).then((response: IGetPostsResponse) => {
            this.getCb(response);
            this.isGetPostsInProgress = false;
            this.hasMorePosts = response.list && response.list.length !== 0;
        });
    }

    private getCb(response:IGetPostsResponse) {
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
    }

    private handleErrorResponse(response: IGetPostsResponse){
        var onError = this.options.onRequestError;
        if (onError){
            onError(response);
        }
        else{
            services.ui.showAlert({
                msg: response.error,
                type: AlertType.Danger
            });
        }
    }

    private mapPosts(posts:Array<IPost>) {
        var result = [];
        for (var i = 0; i < posts.length; i++) {
            var post = posts[i];
            var mappedPost = new postContainer.Post(post);
            result.push(mappedPost);
        }

        return result;
    }

    private bindScroll() {
        var lastPost = () => {
            return $(this.postContainerSelector + ' .post:last');
        };

        var cb = () => {
            this.getPosts();
        };

        this.scrollSubscriberId = services.ui.onScrollVisibleBottom(lastPost, cb);
    }

    private unbindScroll(){
        services.ui.offScrollVisibleBottom(this.scrollSubscriberId);
    }
}