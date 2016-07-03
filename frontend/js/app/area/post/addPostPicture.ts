/// <reference path='../../../typings/refs.d.ts' />
import ko = require('knockout');
import routes = require('../../routes');
import services = require('../../core/services/services');

export class AddPostPicture {
    model = {
        pictureUrl: ko.observable(''),
        title: ko.observable(''),
        pictureType: ko.observable(PostContentType.UrlPicture)
    };

    isPictureUploaded = ko.observable(false);
    picture = ko.observable('');
    uploadButtonText: KnockoutComputed<string>;
    uploadOptions: Components.IUploadButtonComponentOptions;

    validator: KnockoutValidationGroup;
    isSaving = false;

    constructor() {
        this.initComponents();
        this.initValidations();
    }

    save(){
        if (this.isSaving){
            return;
        }

        if (!this.valid()){
            return;
        }

        this.isSaving = true;
        var request = this.getSaveRequest();
        services.server.post(routes.post.savePost, request).then((response) => {
            this.saveCb(response);
        });
    }

    clearUploadedPicture = () => {
        this.isPictureUploaded(false);
        this.picture(null);
    };

    pictureEditRotateLeft = () => {
        this.editPicture(PictureEditAction.RotateLeft);
    };

    pictureEditRotateRight = () => {
        this.editPicture(PictureEditAction.RotateRight);
    };

    reset() {
        this.clearUploadedPicture();
        this.model.pictureUrl('');
        this.model.title('');
        this.model.pictureType(PostContentType.UrlPicture);
        this.validator.errors.showAllMessages(false);
    }

    private editPicture(action: PictureEditAction){
        var request: IEditPictureRequest = {
            action: action,
            url: this.clearPictureUrl(this.picture())
        };
        services.server.post(routes.post.editUploadedPostPicture, request).then((response) => {
            this.reloadEditedPicture();
        });
    }

    private reloadEditedPicture(){
        var pic = this.picture();
        var uploadedPicture = this.clearPictureUrl(pic);
        uploadedPicture = this.makeDirtyPictureUrl(uploadedPicture);

        this.picture(uploadedPicture);
    }

    private clearPictureUrl(url){
        var idx = url.indexOf('?');
        if (idx !== -1){
            url = url.substr(0, idx);
        }

        return url;
    }

    private makeDirtyPictureUrl(url){
        return url + '?' + new Date().getTime();
    }

    private initComponents(){
        this.uploadButtonText = ko.computed(() => {
            return !this.isPictureUploaded()
                ? window.mltId.post_add_btn_upload
                : window.mltId.post_add_upload_other
        });

        this.uploadOptions = {
            uploadUrl: routes.post.uploadPostPicture,
            data: null,
            btnText: this.uploadButtonText,
            uploadCb: (response: IUploadPostPictureResponse) => {
                this.picture(response.pictureUrl);
                this.isPictureUploaded(true);
            },
            fileType: UploadFileType.Picture
        };
    }

    private initValidations(){
        this.model.pictureUrl.extend({
            mustBeFilledOne: {
                params: this.isPictureUploaded,
                message: window.mltId.post_add_upload_or_enter_url
            },
            imageUrl: {
                params: {skipValidation: this.isPictureUploaded},
                message: window.mltId.post_add_invalid_picture_url
            }
        });

        this.model.title.extend({
            required: {message: window.mltId.post_add_title_required}
        });

        this.validator = ko.validatedObservable({
            title: this.model.title,
            pictureUrl: this.model.pictureUrl
        });
    }

    private valid() {
        var result = true;
        if (!this.validator.isValid()){
            result = false;
            this.validator.errors.showAllMessages();
        }

        return result;
    }

    private getSaveRequest(): ISavePostRequest{
        var picture: string;
        var picType: PostContentType;

        if (this.isPictureUploaded()){
            picture = this.clearPictureUrl(this.picture());
            picType = PostContentType.UploadedPicture
        }
        else{
            picture = this.model.pictureUrl();
            picType = PostContentType.UrlPicture;
        }

        return {
            contentUrl: picture,
            title: this.model.title(),
            contentType: picType
        }
    }

    private saveCb(response: ISavePostResponse){
        if (response.error){
            alert('Error: ' + response.error);
        }
        else{
            services.currentAccount.postAdded();
            services.nav.goTo(Routes.Home);
        }

        this.isSaving = false;
    }
}