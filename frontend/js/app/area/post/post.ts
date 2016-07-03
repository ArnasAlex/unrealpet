/// <reference path='../../../typings/refs.d.ts' />
import ko = require('knockout');
import services = require('../../core/services/services');
import router = require('plugins/router');
import routes = require('../../routes');
import _ = require('lodash');
import postContainer = require('../../core/components/post/postContainer');

class Post extends postContainer.PostContainer {
    private id: string;
    postData: KnockoutObservable<postContainer.Post> = ko.observable(null);
    editModal: EditModal;
    canEdit = false;

    constructor() {
        super();
    }

    activate(postId: string) {
        this.id = postId;
        this.editModal = new EditModal(this.getPost);
        this.getPost();
    }

    bindingComplete() {
        this.bindEvents();
    }

    deactivate(){
        this.unbindEvents();
    }

    edit = () => {
        this.editModal.open(this.postData());
    };

    private getPost = () => {
        var request: IGetPostRequest = {
            id: this.id
        };

        services.server.get(routes.post.getPost, request).then((response: IGetPostResponse) => {
            this.getCb(response);
        });
    };

    private getCb(response: IGetPostResponse) {
        if (response.error || !response.post) {
            services.ui.showMessage({
                msg: window.mltId.error_post_not_exist,
                title: window.mltId.error_post_not_exist,
                closeCb: (result: ModalResult) => {services.nav.goTo(Routes.Home)},
                primaryBtnLbl: window.mltId.menu_home
            });
        }
        else {
            var post = new postContainer.Post(response.post);
            this.canEdit = response.post.canEdit;           // Must be set before postData set for 'if' binding
            this.postData(post);
            setTimeout(() => {
                var commentButton = $('.post .comment-button');
               this.toggleComments(post, commentButton);
            }, 500);    // Needs time for render
        }
    }

}

export = Post;

class EditModal {
    title = ko.observable('');
    post: postContainer.Post;
    private modalSelector = '#postEditModal';
    private isRemoval: boolean;

    constructor(private refreshPost: () => void){
    }

    open = (post: postContainer.Post) => {
        this.post = post;
        this.title(post.title);
        $(this.modalSelector).modal('show');
    };

    remove = () => {
        var req: IEditPostRequest = {
            id: this.post.id,
            isRemoval: true
        };

        this.edit(req);
    };

    save = () => {
        var req: IEditPostRequest = {
            id: this.post.id,
            title: this.title(),
            isRemoval: false
        };

        this.edit(req);
    };

    private edit(req: IEditPostRequest) {
        this.isRemoval = req.isRemoval;
        services.server.post(routes.post.editPost, req).then(this.editCb);
    }

    private editCb = (response: IEditPostResponse) => {
        if (response.error){
            services.ui.showAlert({
                msg: response.error,
                type: AlertType.Danger,
                icon: 'fa-exclamation'
            });
        }
        else{
            if (this.isRemoval){
                // modal close and navigating causes modal overlay to stay on the screen
                $(this.modalSelector).one('hidden.bs.modal', (e) => {
                    services.nav.goToUrl('#posts');
                });
            }
            else{
                this.refreshPost();
            }
            this.showSuccessMsg()
        }
    };

    private showSuccessMsg(){
        services.ui.showAlert({
            msg: this.isRemoval ? window.mltId.alert_delete_success : window.mltId.alert_save_success,
            type: AlertType.Success,
            icon: 'fa-check'
        });
    }
}