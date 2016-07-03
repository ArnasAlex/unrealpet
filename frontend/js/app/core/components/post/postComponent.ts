// <reference path='../../../../typings/refs.d.ts' />
import component = require('../base/component');
import postContainer = require('./postContainer');

export class PostComponent extends component.Component {
    name = 'post';
    createViewModel = () => { return new PostViewModel(); };
    template = { require: this.getBaseTemplatePath() + '/post/postComponent.html' }
}

class PostViewModel {
    data: postContainer.Post;
    container: postContainer.PostContainer;

    init(options: IPostComponentOptions, element: JQuery){
        this.data = options.data;
        this.container = options.container;
    }
}

interface IPostComponentOptions {
    data: postContainer.Post;
    container: postContainer.PostContainer;
}