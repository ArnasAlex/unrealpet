/// <reference path='../../../typings/refs.d.ts' />
import ko = require('knockout');
import routes = require('../../routes');
import services = require('../../core/services/services');
import picUpload = require('./accountPictureUpload');

class AccountPet {
    model = {
        name: ko.observable(''),
        type: ko.observable(0),
        breed: ko.observable(''),
        birthday: ko.observable(''),
        about: ko.observable(''),
        picture: ko.observable(''),
        logo: ko.observable('')
    };
    upload: picUpload.AccountPictureUpload;
    petTypes: AccountPetType[];

    validator: KnockoutValidationGroup;

    constructor() {
        var list = this.initPictureDetailsList();
        this.upload = new picUpload.AccountPictureUpload(list);
        this.initPetTypes();

        this.model.name.extend({
            required: {message: window.mltId.validation_required}
        });

        this.validator = ko.validatedObservable({
            name: this.model.name
        });
    }

    private initPictureDetailsList() {
        var pictureDetailsList = [];

        var logo: picUpload.IAccountPictureDetails = {
            type: AccountPictures.Logo,
            name: window.mltId.account_logo,
            url: this.model.logo
        };
        pictureDetailsList[logo.type] = logo;

        var main: picUpload.IAccountPictureDetails = {
            type: AccountPictures.Main,
            name: window.mltId.account_main_picture,
            url: this.model.picture
        };
        pictureDetailsList[main.type] = main;

        return pictureDetailsList;
    }

    private initPetTypes(){
        var types = _.map(services.enum.petTypes, (petType) => {
            var result = new AccountPetType(petType, this.model.type);
            return result;
        });

        this.petTypes = types;
    }

    activate() {
        this.getAccount();
    }

    selectPetType = (petType: AccountPetType) => {
        this.model.type(petType.value);
    };

    save() {
        if (!this.valid()){
            return;
        }

        var request = this.getSaveRequest();
        services.server.post(routes.account.saveAccount, request).then((response) => {
            this.saveCb(response);
        });
    }

    removePicture() {
        var closeCb = (result: ModalResult) => {
            if (result === ModalResult.Primary){
                services.server.post(routes.account.removeAccountPicture, {type: this.upload.pictureDetails().type }).then((response) => {
                    this.removePictureCb(response);
                });
            }
        };

        services.ui.showMessage({
            msg: window.mltId.account_remove_picture_confirm_msg,
            title: window.mltId.account_remove_picture_confirm_title,
            showSecondButton: true,
            closeCb: closeCb,
            primaryBtnLbl: window.mltId.control_yes,
            secondaryBtnLbl: window.mltId.control_no
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

    private removePictureCb(response: IResponse){
        if (!response.error){
            this.upload.pictureDetails().url(null);
        }
    }

    private getAccount(){
        var request: IGetAccountRequest = {};
        services.server.get(routes.account.getAccount, request).then((response) => {
            this.getAccountCb(response);
        })
    }

    private getAccountCb(response: IGetAccountResponse){
        if (!response.error){
            this.model.name(response.name);
            this.model.type(response.type);
            this.model.breed(response.breed);
            this.model.birthday(response.birthday);
            this.model.about(response.about);
            this.model.picture(response.picture);
            this.model.logo(response.logo);
        }
    }

    private getSaveRequest(): ISaveAccountRequest{
        return {
            name: this.model.name(),
            type: this.model.type(),
            breed: this.model.breed(),
            birthday: this.model.birthday(),
            about: this.model.about()
        }
    }

    private saveCb(response: ISaveAccountResponse){
        if (!response.error) {
            services.ui.showAlert(
                {
                    msg: window.mltId.alert_save_success,
                    type: AlertType.Success,
                    icon: 'fa-check'
                });
            services.currentAccount.getCurrentUser();
        } else {
            services.ui.showAlert(
                {
                    msg: window.mltId.server_error_default,
                    type: AlertType.Danger,
                    icon: 'fa-exclamation'
                });
        }
    }
}

class AccountPetType implements INameValue<PetType>{
    css: string;
    isSelected: KnockoutComputed<boolean>;
    name: string;
    value: PetType;

    constructor(type: INameValue<PetType>, selectedValue: KnockoutObservable<PetType>){
        this.value = type.value;
        this.name = type.name;
        this.isSelected = ko.computed(() => { return this.value === selectedValue(); });
        this.css = services.ui.getClassForPetType(this.value);
    }
}

export = AccountPet;