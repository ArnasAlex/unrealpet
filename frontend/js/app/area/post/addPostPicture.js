define(["require", "exports", 'knockout', '../../routes', '../../core/services/services'], function (require, exports, ko, routes, services) {
    var AddPostPicture = (function () {
        function AddPostPicture() {
            var _this = this;
            this.model = {
                pictureUrl: ko.observable(''),
                title: ko.observable(''),
                pictureType: ko.observable(2 /* UrlPicture */)
            };
            this.isPictureUploaded = ko.observable(false);
            this.picture = ko.observable('');
            this.isSaving = false;
            this.clearUploadedPicture = function () {
                _this.isPictureUploaded(false);
                _this.picture(null);
            };
            this.pictureEditRotateLeft = function () {
                _this.editPicture(1 /* RotateLeft */);
            };
            this.pictureEditRotateRight = function () {
                _this.editPicture(2 /* RotateRight */);
            };
            this.initComponents();
            this.initValidations();
        }
        AddPostPicture.prototype.save = function () {
            var _this = this;
            if (this.isSaving) {
                return;
            }
            if (!this.valid()) {
                return;
            }
            this.isSaving = true;
            var request = this.getSaveRequest();
            services.server.post(routes.post.savePost, request).then(function (response) {
                _this.saveCb(response);
            });
        };
        AddPostPicture.prototype.reset = function () {
            this.clearUploadedPicture();
            this.model.pictureUrl('');
            this.model.title('');
            this.model.pictureType(2 /* UrlPicture */);
            this.validator.errors.showAllMessages(false);
        };
        AddPostPicture.prototype.editPicture = function (action) {
            var _this = this;
            var request = {
                action: action,
                url: this.clearPictureUrl(this.picture())
            };
            services.server.post(routes.post.editUploadedPostPicture, request).then(function (response) {
                _this.reloadEditedPicture();
            });
        };
        AddPostPicture.prototype.reloadEditedPicture = function () {
            var pic = this.picture();
            var uploadedPicture = this.clearPictureUrl(pic);
            uploadedPicture = this.makeDirtyPictureUrl(uploadedPicture);
            this.picture(uploadedPicture);
        };
        AddPostPicture.prototype.clearPictureUrl = function (url) {
            var idx = url.indexOf('?');
            if (idx !== -1) {
                url = url.substr(0, idx);
            }
            return url;
        };
        AddPostPicture.prototype.makeDirtyPictureUrl = function (url) {
            return url + '?' + new Date().getTime();
        };
        AddPostPicture.prototype.initComponents = function () {
            var _this = this;
            this.uploadButtonText = ko.computed(function () {
                return !_this.isPictureUploaded() ? window.mltId.post_add_btn_upload : window.mltId.post_add_upload_other;
            });
            this.uploadOptions = {
                uploadUrl: routes.post.uploadPostPicture,
                data: null,
                btnText: this.uploadButtonText,
                uploadCb: function (response) {
                    _this.picture(response.pictureUrl);
                    _this.isPictureUploaded(true);
                },
                fileType: 1 /* Picture */
            };
        };
        AddPostPicture.prototype.initValidations = function () {
            this.model.pictureUrl.extend({
                mustBeFilledOne: {
                    params: this.isPictureUploaded,
                    message: window.mltId.post_add_upload_or_enter_url
                },
                imageUrl: {
                    params: { skipValidation: this.isPictureUploaded },
                    message: window.mltId.post_add_invalid_picture_url
                }
            });
            this.model.title.extend({
                required: { message: window.mltId.post_add_title_required }
            });
            this.validator = ko.validatedObservable({
                title: this.model.title,
                pictureUrl: this.model.pictureUrl
            });
        };
        AddPostPicture.prototype.valid = function () {
            var result = true;
            if (!this.validator.isValid()) {
                result = false;
                this.validator.errors.showAllMessages();
            }
            return result;
        };
        AddPostPicture.prototype.getSaveRequest = function () {
            var picture;
            var picType;
            if (this.isPictureUploaded()) {
                picture = this.clearPictureUrl(this.picture());
                picType = 1 /* UploadedPicture */;
            }
            else {
                picture = this.model.pictureUrl();
                picType = 2 /* UrlPicture */;
            }
            return {
                contentUrl: picture,
                title: this.model.title(),
                contentType: picType
            };
        };
        AddPostPicture.prototype.saveCb = function (response) {
            if (response.error) {
                alert('Error: ' + response.error);
            }
            else {
                services.currentAccount.postAdded();
                services.nav.goTo(1 /* Home */);
            }
            this.isSaving = false;
        };
        return AddPostPicture;
    })();
    exports.AddPostPicture = AddPostPicture;
});
//# sourceMappingURL=addPostPicture.js.map