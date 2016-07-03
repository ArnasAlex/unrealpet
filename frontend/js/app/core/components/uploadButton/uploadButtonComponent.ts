/// <reference path="../../../../typings/refs.d.ts" />
import component = require('../base/component');
import ko = require('knockout');
import services = require('../../services/services');

export class UploadButtonComponent extends component.Component {
    name = 'upload-button';
    createViewModel = () => { return new UploadButtonComponentViewModel(); };
    template = `<span class="btn btn-success fileinput-button">
                    <i class="fa fa-upload"></i>
                    <span data-bind="text: btnText"></span>
                    <input type="file" name="file">
                </span>`;
}

class UploadButtonComponentViewModel implements Components.IComponentViewModel{
    btnText: KnockoutObservable<string> | string;
    private options: Components.IUploadButtonComponentOptions;
    private element: JQuery;
    private pictureFileExtensions = ['gif', 'jpg', 'jpeg', 'png'];
    private videoFileExtensions = ['mp4', 'avi', 'wmv', '3gp'];
    private maxFileSize = 50000000; // 50mb

    init(options, element){
        this.options = options;
        this.element = element;

        this.btnText = this.options.btnText;
        this.bindUpload();
    }

    private bindUpload() {
        var $el = $(this.element).find('input');
        $el.fileupload({
            url: this.options.uploadUrl,
            dataType: 'json',
            done: (e, data) => {
                var response: IResponse = data.result;
                if (!response.error) {
                    if (this.options.progress) {
                        this.options.progress(UploadProgress.Success);
                    }
                    this.options.uploadCb(response);
                }
                else {
                    this.options.progress(UploadProgress.Error);
                }
            },
            add: (e, data) => {
                var uploadFile = data.files[0];
                if (this.validate(uploadFile)){
                    if (this.options.progress) {
                        this.options.progress(UploadProgress.Progress);
                        if(this.options.progressPercent){
                            this.options.progressPercent(0);
                        }
                    }

                    data.submit();
                }
            },
            progressall: (e, data:any) => {
                if(this.options.progressPercent){
                    var progress = parseInt((data.loaded / data.total * 100).toString(), 10);
                    this.options.progressPercent(progress);
                }
            },
            fail: (evt, uploadObject)=>{
                var status = uploadObject.xhr().status;
                services.server.handleErrors(status);
            }
        });

        var submitCb: any = (e, data: any) => {
            data.formData = ko.unwrap(this.options.data);
        };

        $el.bind('fileuploadsubmit', submitCb);
    }

    private validate(uploadFile: any){
        var isValid = true;
        if (!this.isValidFileExtension(uploadFile.name)) {
            services.ui.showMessage({
                msg: window.mltId.upload_invalid_file_type_message + this.getFileExtensions().join(', '),
                title: window.mltId.upload_invalid_file_type_title + ' ' + uploadFile.name
            });
            isValid = false;
        }

        if (uploadFile.size > this.maxFileSize){
            services.ui.showMessage({
                msg: window.mltId.upload_invalid_file_size_msg,
                title: window.mltId.upload_invalid_file_size_title
            });
            isValid = false;
        }

        return isValid;
    }

    private isValidFileExtension(fileName: string){
        var arr = this.getFileExtensions();
        var extension = fileName.split('.').pop();
        if (!extension){
            return false;
        }
        extension = extension.toLocaleLowerCase();
        return arr.indexOf(extension) !== -1;
    }

    private getFileExtensions(): string[]{
        var arr = [];
        switch(this.options.fileType){
            case UploadFileType.Picture:
                arr = this.pictureFileExtensions;
                break;
            case UploadFileType.Video:
                arr = this.videoFileExtensions;
                break;
        }

        return arr;
    }
}