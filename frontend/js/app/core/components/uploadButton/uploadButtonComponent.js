var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", '../base/component', 'knockout', '../../services/services'], function (require, exports, component, ko, services) {
    var UploadButtonComponent = (function (_super) {
        __extends(UploadButtonComponent, _super);
        function UploadButtonComponent() {
            _super.apply(this, arguments);
            this.name = 'upload-button';
            this.createViewModel = function () {
                return new UploadButtonComponentViewModel();
            };
            this.template = "<span class=\"btn btn-success fileinput-button\">\n                    <i class=\"fa fa-upload\"></i>\n                    <span data-bind=\"text: btnText\"></span>\n                    <input type=\"file\" name=\"file\">\n                </span>";
        }
        return UploadButtonComponent;
    })(component.Component);
    exports.UploadButtonComponent = UploadButtonComponent;
    var UploadButtonComponentViewModel = (function () {
        function UploadButtonComponentViewModel() {
            this.pictureFileExtensions = ['gif', 'jpg', 'jpeg', 'png'];
            this.videoFileExtensions = ['mp4', 'avi', 'wmv', '3gp'];
            this.maxFileSize = 50000000;
        }
        UploadButtonComponentViewModel.prototype.init = function (options, element) {
            this.options = options;
            this.element = element;
            this.btnText = this.options.btnText;
            this.bindUpload();
        };
        UploadButtonComponentViewModel.prototype.bindUpload = function () {
            var _this = this;
            var $el = $(this.element).find('input');
            $el.fileupload({
                url: this.options.uploadUrl,
                dataType: 'json',
                done: function (e, data) {
                    var response = data.result;
                    if (!response.error) {
                        if (_this.options.progress) {
                            _this.options.progress(2 /* Success */);
                        }
                        _this.options.uploadCb(response);
                    }
                    else {
                        _this.options.progress(3 /* Error */);
                    }
                },
                add: function (e, data) {
                    var uploadFile = data.files[0];
                    if (_this.validate(uploadFile)) {
                        if (_this.options.progress) {
                            _this.options.progress(1 /* Progress */);
                            if (_this.options.progressPercent) {
                                _this.options.progressPercent(0);
                            }
                        }
                        data.submit();
                    }
                },
                progressall: function (e, data) {
                    if (_this.options.progressPercent) {
                        var progress = parseInt((data.loaded / data.total * 100).toString(), 10);
                        _this.options.progressPercent(progress);
                    }
                },
                fail: function (evt, uploadObject) {
                    var status = uploadObject.xhr().status;
                    services.server.handleErrors(status);
                }
            });
            var submitCb = function (e, data) {
                data.formData = ko.unwrap(_this.options.data);
            };
            $el.bind('fileuploadsubmit', submitCb);
        };
        UploadButtonComponentViewModel.prototype.validate = function (uploadFile) {
            var isValid = true;
            if (!this.isValidFileExtension(uploadFile.name)) {
                services.ui.showMessage({
                    msg: window.mltId.upload_invalid_file_type_message + this.getFileExtensions().join(', '),
                    title: window.mltId.upload_invalid_file_type_title + ' ' + uploadFile.name
                });
                isValid = false;
            }
            if (uploadFile.size > this.maxFileSize) {
                services.ui.showMessage({
                    msg: window.mltId.upload_invalid_file_size_msg,
                    title: window.mltId.upload_invalid_file_size_title
                });
                isValid = false;
            }
            return isValid;
        };
        UploadButtonComponentViewModel.prototype.isValidFileExtension = function (fileName) {
            var arr = this.getFileExtensions();
            var extension = fileName.split('.').pop();
            if (!extension) {
                return false;
            }
            extension = extension.toLocaleLowerCase();
            return arr.indexOf(extension) !== -1;
        };
        UploadButtonComponentViewModel.prototype.getFileExtensions = function () {
            var arr = [];
            switch (this.options.fileType) {
                case 1 /* Picture */:
                    arr = this.pictureFileExtensions;
                    break;
                case 2 /* Video */:
                    arr = this.videoFileExtensions;
                    break;
            }
            return arr;
        };
        return UploadButtonComponentViewModel;
    })();
});
//# sourceMappingURL=uploadButtonComponent.js.map