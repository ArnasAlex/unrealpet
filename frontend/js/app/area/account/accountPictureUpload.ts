/// <reference path='../../../typings/refs.d.ts' />
import ko = require('knockout');
import routes = require('../../routes');

export class AccountPictureUpload {
    progress = ko.observable(UploadProgress.NoAction);
    options: Components.IUploadButtonComponentOptions;
    isPictureUploaded: KnockoutComputed<boolean>;
    btnText: KnockoutComputed<string>;
    selectedPictureType = ko.observable(AccountPictures.Logo);
    data: KnockoutComputed<any>;
    pictureDetails = ko.observable<IAccountPictureDetails>();
    pictureDetailsList: Array<IAccountPictureDetails> = [];
    pictureUrl = ko.observable<string>();

    constructor(list: Array<IAccountPictureDetails>){
        this.pictureDetailsList = list;
        this.updateSelectedPictureDetails();
        this.init();
    }

    private init(){
        this.isPictureUploaded = ko.computed(() => {
            var pic = this.pictureDetails().url();
            return pic && pic.length > 0;
        });

        this.btnText = ko.computed(() => {
            return this.isPictureUploaded() ? window.mltId.account_change_picture : window.mltId.account_upload;
        });

        this.data = ko.computed(() => {
            return {type: this.pictureDetails().type};
        });

        this.options = {
            btnText: this.btnText,
            uploadUrl: routes.account.uploadAccountPicture,
            uploadCb: (response: IUploadAccountPictureResponse) => { this.pictureDetails().url(response.pictureUrl); },
            progress: this.progress,
            data: this.data,
            fileType: UploadFileType.Picture
        };
    }

    changeSelectedPicture(type: AccountPictures) {
        this.selectedPictureType(type);
        this.updateSelectedPictureDetails();
    }

    private updateSelectedPictureDetails(){
        this.pictureDetails(this.pictureDetailsList[this.selectedPictureType()]);
        this.pictureUrl(this.pictureDetails().url());
    }
}

export interface IAccountPictureDetails {
    type: AccountPictures;
    name: string;
    url: KnockoutObservable<string>
}