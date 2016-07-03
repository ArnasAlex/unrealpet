define(["require", "exports", 'knockout', './addPostPicture', './addPostVideo'], function (require, exports, ko, addPostPicture, addPostVideo) {
    var AddPost = (function () {
        function AddPost() {
            var _this = this;
            this.mode = ko.observable(0 /* Undefined */);
            this.setMode = function (mode) {
                _this.mode(mode);
                _this.picture.reset();
                _this.video.reset();
            };
            this.save = function () {
                if (_this.mode() == 1 /* Picture */) {
                    _this.picture.save();
                }
                else {
                    _this.video.save();
                }
            };
        }
        AddPost.prototype.activate = function () {
            var _this = this;
            this.picture = new addPostPicture.AddPostPicture();
            this.video = new addPostVideo.AddPostVideo();
            this.backButtonText = ko.computed(function () {
                return _this.mode() === 1 /* Picture */ ? window.mltId.post_add_video : window.mltId.post_add_picture;
            });
        };
        return AddPost;
    })();
    return AddPost;
});
//# sourceMappingURL=addPost.js.map