/// <reference path='../../../typings/refs.d.ts' />
import ko = require('knockout');
import routes = require('../../routes');
import services = require('../../core/services/services');
import addPostPicture = require('./addPostPicture');
import addPostVideo = require('./addPostVideo');

class AddPost {
    mode = ko.observable(AddPostMode.Undefined);
    backButtonText: KnockoutComputed<string>;
    picture: addPostPicture.AddPostPicture;
    video: addPostVideo.AddPostVideo;

    constructor() {
    }

    activate() {
        this.picture = new addPostPicture.AddPostPicture();
        this.video = new addPostVideo.AddPostVideo();

        this.backButtonText = ko.computed(() => {
            return this.mode() === AddPostMode.Picture
                ? window.mltId.post_add_video
                : window.mltId.post_add_picture;
        });
    }

    setMode = (mode: AddPostMode) => {
        this.mode(mode);
        this.picture.reset();
        this.video.reset();
    };

    save = () => {
        if (this.mode() == AddPostMode.Picture){
            this.picture.save();
        }
        else{
            this.video.save();
        }
    }
}

export = AddPost;

declare const enum AddPostMode {
    Undefined = 0,
    Picture = 1,
    Video = 2
}