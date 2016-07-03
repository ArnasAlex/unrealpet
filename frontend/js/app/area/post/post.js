var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'knockout', '../../core/services/services', '../../routes', '../../core/components/post/postContainer'], function (require, exports, ko, services, routes, postContainer) {
    var Post = (function (_super) {
        __extends(Post, _super);
        function Post() {
            var _this = this;
            _super.call(this);
            this.postData = ko.observable(null);
            this.canEdit = false;
            this.edit = function () {
                _this.editModal.open(_this.postData());
            };
            this.getPost = function () {
                var request = {
                    id: _this.id
                };
                services.server.get(routes.post.getPost, request).then(function (response) {
                    _this.getCb(response);
                });
            };
        }
        Post.prototype.activate = function (postId) {
            this.id = postId;
            this.editModal = new EditModal(this.getPost);
            this.getPost();
        };
        Post.prototype.bindingComplete = function () {
            this.bindEvents();
        };
        Post.prototype.deactivate = function () {
            this.unbindEvents();
        };
        Post.prototype.getCb = function (response) {
            var _this = this;
            if (response.error || !response.post) {
                services.ui.showMessage({
                    msg: window.mltId.error_post_not_exist,
                    title: window.mltId.error_post_not_exist,
                    closeCb: function (result) {
                        services.nav.goTo(1 /* Home */);
                    },
                    primaryBtnLbl: window.mltId.menu_home
                });
            }
            else {
                var post = new postContainer.Post(response.post);
                this.canEdit = response.post.canEdit;
                this.postData(post);
                setTimeout(function () {
                    var commentButton = $('.post .comment-button');
                    _this.toggleComments(post, commentButton);
                }, 500);
            }
        };
        return Post;
    })(postContainer.PostContainer);
    var EditModal = (function () {
        function EditModal(refreshPost) {
            var _this = this;
            this.refreshPost = refreshPost;
            this.title = ko.observable('');
            this.modalSelector = '#postEditModal';
            this.open = function (post) {
                _this.post = post;
                _this.title(post.title);
                $(_this.modalSelector).modal('show');
            };
            this.remove = function () {
                var req = {
                    id: _this.post.id,
                    isRemoval: true
                };
                _this.edit(req);
            };
            this.save = function () {
                var req = {
                    id: _this.post.id,
                    title: _this.title(),
                    isRemoval: false
                };
                _this.edit(req);
            };
            this.editCb = function (response) {
                if (response.error) {
                    services.ui.showAlert({
                        msg: response.error,
                        type: 3 /* Danger */,
                        icon: 'fa-exclamation'
                    });
                }
                else {
                    if (_this.isRemoval) {
                        $(_this.modalSelector).one('hidden.bs.modal', function (e) {
                            services.nav.goToUrl('#posts');
                        });
                    }
                    else {
                        _this.refreshPost();
                    }
                    _this.showSuccessMsg();
                }
            };
        }
        EditModal.prototype.edit = function (req) {
            this.isRemoval = req.isRemoval;
            services.server.post(routes.post.editPost, req).then(this.editCb);
        };
        EditModal.prototype.showSuccessMsg = function () {
            services.ui.showAlert({
                msg: this.isRemoval ? window.mltId.alert_delete_success : window.mltId.alert_save_success,
                type: 0 /* Success */,
                icon: 'fa-check'
            });
        };
        return EditModal;
    })();
    return Post;
});
//# sourceMappingURL=post.js.map