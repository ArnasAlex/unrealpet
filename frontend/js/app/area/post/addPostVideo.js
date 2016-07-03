define(["require", "exports", 'knockout', '../../routes', '../../core/services/services'], function (require, exports, ko, routes, services) {
    var AddPostVideo = (function () {
        function AddPostVideo() {
            var _this = this;
            this.model = {
                videoUrl: ko.observable(''),
                title: ko.observable('')
            };
            this.isVideoUploaded = ko.observable(false);
            this.isSaving = false;
            this.videoElId = '#addPostVideoContent';
            this.clearUploadedVideo = function () {
                _this.isVideoUploaded(false);
            };
            this.videoUploaded = function (response) {
                if (_this.model.videoUrl()) {
                    var oldVid = $(_this.videoElId)[0];
                    oldVid.pause();
                }
                _this.model.videoUrl(response.videoUrl);
                _this.isVideoUploaded(true);
                var vid = $(_this.videoElId)[0];
                $(vid).hide();
                var parent = $(vid).closest('.video-info-container');
                parent.find('.cover-container').show();
            };
            this.initComponents();
            this.initValidations();
        }
        AddPostVideo.prototype.save = function () {
            var _this = this;
            if (this.isSaving) {
                return;
            }
            this.isSaving = true;
            if (!this.valid()) {
                return;
            }
            var request = this.getSaveRequest();
            services.server.post(routes.post.savePost, request).then(function (response) {
                _this.saveCb(response);
            });
        };
        AddPostVideo.prototype.reset = function () {
            this.clearUploadedVideo();
            this.model.title('');
            this.validator.errors.showAllMessages(false);
        };
        AddPostVideo.prototype.onCoverClick = function (model, evt) {
            var target = window.getTarget(evt);
            var parent = target.closest('.video-info-container');
            var video = parent.find('video')[0];
            video.load();
            video.play();
            $(video).show();
            parent.find('.cover-container').hide();
        };
        AddPostVideo.prototype.clearVideoUrl = function (url) {
            var idx = url.indexOf('?');
            if (idx !== -1) {
                url = url.substr(0, idx);
            }
            return url;
        };
        AddPostVideo.prototype.makeDirtyUrl = function (url) {
            return url + '?' + new Date().getTime();
        };
        AddPostVideo.prototype.initComponents = function () {
            var _this = this;
            this.uploadButtonText = ko.computed(function () {
                return !_this.isVideoUploaded() ? window.mltId.post_add_upload_video : window.mltId.post_add_upload_video_other;
            });
            this.uploadOptions = {
                uploadUrl: routes.post.uploadPostVideo,
                data: null,
                btnText: this.uploadButtonText,
                uploadCb: this.videoUploaded,
                fileType: 2 /* Video */,
                progress: ko.observable(0 /* NoAction */),
                progressPercent: ko.observable(0)
            };
            this.uploadIcon = ko.computed(function () {
                return _this.uploadOptions.progress() == 1 /* Progress */ ? 'fa-circle-o-notch fa-spin' : 'fa-video-camera';
            });
            this.uploadInfo = ko.computed(function () {
                var result;
                if (_this.uploadOptions.progress() == 1 /* Progress */) {
                    result = window.mltId.upload_in_progress + ' ' + _this.uploadOptions.progressPercent() + '%';
                }
                else {
                    result = window.mltId.post_add_video_alt;
                }
                return result;
            });
            this.coverUrl = ko.computed(function () {
                var videoUrl = _this.model.videoUrl();
                if (!videoUrl) {
                    return null;
                }
                var coverUrl = videoUrl.substr(0, videoUrl.lastIndexOf('.')) + '.jpeg';
                return coverUrl;
            });
        };
        AddPostVideo.prototype.initValidations = function () {
            this.model.videoUrl.extend({
                required: {
                    message: window.mltId.post_add_must_upload_video
                }
            });
            this.model.title.extend({
                required: { message: window.mltId.post_add_title_required }
            });
            this.validator = ko.validatedObservable({
                title: this.model.title,
                videoUrl: this.model.videoUrl
            });
        };
        AddPostVideo.prototype.valid = function () {
            var result = true;
            if (!this.validator.isValid()) {
                result = false;
                this.validator.errors.showAllMessages();
            }
            return result;
        };
        AddPostVideo.prototype.getSaveRequest = function () {
            var video = this.clearVideoUrl(this.model.videoUrl());
            return {
                contentType: 3 /* Video */,
                contentUrl: video,
                title: this.model.title()
            };
        };
        AddPostVideo.prototype.saveCb = function (response) {
            if (response.error) {
                alert('Error: ' + response.error);
            }
            else {
                services.currentAccount.postAdded();
                services.nav.goTo(1 /* Home */);
            }
            this.isSaving = false;
        };
        return AddPostVideo;
    })();
    exports.AddPostVideo = AddPostVideo;
});
//# sourceMappingURL=addPostVideo.js.map