/// <reference path='../../../typings/refs.d.ts' />
import ko = require('knockout');
import routes = require('../../routes');
import services = require('../../core/services/services');

export class AddPostVideo {
    model = {
        videoUrl: ko.observable(''),
        title: ko.observable('')
    };

    isVideoUploaded = ko.observable(false);
    uploadOptions: Components.IUploadButtonComponentOptions;
    uploadButtonText: KnockoutComputed<string>;
    validator: KnockoutValidationGroup;
    uploadIcon: KnockoutComputed<string>;
    uploadInfo: KnockoutComputed<string>;
    coverUrl: KnockoutComputed<string>;
    isSaving = false;

    private videoElId = '#addPostVideoContent';
    constructor() {
        this.initComponents();
        this.initValidations();
    }

    save(){
        if (this.isSaving){
            return;
        }
        this.isSaving = true;

        if (!this.valid()){
            return;
        }

        var request = this.getSaveRequest();
        services.server.post(routes.post.savePost, request).then((response) => {
            this.saveCb(response);
        });
    }

    clearUploadedVideo = () => {
        this.isVideoUploaded(false);
    };

    reset() {
        this.clearUploadedVideo();
        this.model.title('');
        this.validator.errors.showAllMessages(false);
    }

    onCoverClick(model, evt) {
        var target = window.getTarget(evt);
        var parent = target.closest('.video-info-container');
        var video: HTMLVideoElement = <any>parent.find('video')[0];
        video.load();
        video.play();
        $(video).show();
        parent.find('.cover-container').hide();
    }

    private clearVideoUrl(url){
        var idx = url.indexOf('?');
        if (idx !== -1){
            url = url.substr(0, idx);
        }

        return url;
    }

    private makeDirtyUrl(url){
        return url + '?' + new Date().getTime();
    }

    private initComponents(){
        this.uploadButtonText = ko.computed(() => {
            return !this.isVideoUploaded()
                ? window.mltId.post_add_upload_video
                : window.mltId.post_add_upload_video_other
        });

        this.uploadOptions = {
            uploadUrl: routes.post.uploadPostVideo,
            data: null,
            btnText: this.uploadButtonText,
            uploadCb: this.videoUploaded,
            fileType: UploadFileType.Video,
            progress: ko.observable(UploadProgress.NoAction),
            progressPercent: ko.observable(0)
        };

        this.uploadIcon = ko.computed(() => {
            return this.uploadOptions.progress() == UploadProgress.Progress
                ? 'fa-circle-o-notch fa-spin'
                : 'fa-video-camera'
        });

        this.uploadInfo = ko.computed(() => {
            var result;
            if (this.uploadOptions.progress() == UploadProgress.Progress){
                result = window.mltId.upload_in_progress + ' ' + this.uploadOptions.progressPercent() + '%';
            }
            else {
                result = window.mltId.post_add_video_alt;
            }

            return result;
        });

        this.coverUrl = ko.computed(() => {
            var videoUrl = this.model.videoUrl();
            if (!videoUrl){
                return null;
            }

            var coverUrl = videoUrl.substr(0, videoUrl.lastIndexOf('.')) + '.jpeg';
            return coverUrl;
        });
    }

    private initValidations(){
        this.model.videoUrl.extend({
            required: {
                message: window.mltId.post_add_must_upload_video
            }
        });

        this.model.title.extend({
            required: {message: window.mltId.post_add_title_required}
        });

        this.validator = ko.validatedObservable({
            title: this.model.title,
            videoUrl: this.model.videoUrl
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
        var video = this.clearVideoUrl(this.model.videoUrl());

        return {
            contentType: PostContentType.Video,
            contentUrl: video,
            title: this.model.title()
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

    private videoUploaded = (response: IUploadPostVideoResponse) => {
        if (this.model.videoUrl()){
            var oldVid: HTMLVideoElement = <any>$(this.videoElId)[0];
            oldVid.pause();
        }

        this.model.videoUrl(response.videoUrl);
        this.isVideoUploaded(true);
        var vid: HTMLVideoElement = <any>$(this.videoElId)[0];
        $(vid).hide();
        var parent = $(vid).closest('.video-info-container');
        parent.find('.cover-container').show();
    }
}