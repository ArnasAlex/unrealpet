/// <reference path='../../../typings/refs.d.ts' />
import ko = require('knockout');
import routes = require('../../routes');
import services = require('../../core/services/services');

class Cover {
    uploadOptions: Components.IUploadButtonComponentOptions;
    url = ko.observable('');

    activate() {
        this.refreshCover();

        this.uploadOptions = {
            uploadUrl: routes.admin.uploadCoverPicture,
            data: null,
            btnText: 'Upload Cover',
            uploadCb: (response: IUploadCoverPictureResponse) => {
                if (!response.error){
                    this.refreshCover();
                }
            },
            fileType: UploadFileType.Picture
        };
    }

    private refreshCover = () => {
        var coverUrl = '/uploads/c/cover.jpeg';
        var now = new Date().getTime();

        var url = coverUrl + '?bust='+now;
        this.url(url);
    }
}

export = Cover;