define(["require", "exports", 'knockout', '../../routes', '../../core/services/services', './accountPictureUpload'], function (require, exports, ko, routes, services, picUpload) {
    var AccountPet = (function () {
        function AccountPet() {
            var _this = this;
            this.model = {
                name: ko.observable(''),
                type: ko.observable(0),
                breed: ko.observable(''),
                birthday: ko.observable(''),
                about: ko.observable(''),
                picture: ko.observable(''),
                logo: ko.observable('')
            };
            this.selectPetType = function (petType) {
                _this.model.type(petType.value);
            };
            var list = this.initPictureDetailsList();
            this.upload = new picUpload.AccountPictureUpload(list);
            this.initPetTypes();
            this.model.name.extend({
                required: { message: window.mltId.validation_required }
            });
            this.validator = ko.validatedObservable({
                name: this.model.name
            });
        }
        AccountPet.prototype.initPictureDetailsList = function () {
            var pictureDetailsList = [];
            var logo = {
                type: 2,
                name: window.mltId.account_logo,
                url: this.model.logo
            };
            pictureDetailsList[logo.type] = logo;
            var main = {
                type: 1,
                name: window.mltId.account_main_picture,
                url: this.model.picture
            };
            pictureDetailsList[main.type] = main;
            return pictureDetailsList;
        };
        AccountPet.prototype.initPetTypes = function () {
            var _this = this;
            var types = _.map(services.enum.petTypes, function (petType) {
                var result = new AccountPetType(petType, _this.model.type);
                return result;
            });
            this.petTypes = types;
        };
        AccountPet.prototype.activate = function () {
            this.getAccount();
        };
        AccountPet.prototype.save = function () {
            var _this = this;
            if (!this.valid()) {
                return;
            }
            var request = this.getSaveRequest();
            services.server.post(routes.account.saveAccount, request).then(function (response) {
                _this.saveCb(response);
            });
        };
        AccountPet.prototype.removePicture = function () {
            var _this = this;
            var closeCb = function (result) {
                if (result === 1) {
                    services.server.post(routes.account.removeAccountPicture, { type: _this.upload.pictureDetails().type }).then(function (response) {
                        _this.removePictureCb(response);
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
        };
        AccountPet.prototype.valid = function () {
            var result = true;
            if (!this.validator.isValid()) {
                result = false;
                this.validator.errors.showAllMessages();
            }
            return result;
        };
        AccountPet.prototype.removePictureCb = function (response) {
            if (!response.error) {
                this.upload.pictureDetails().url(null);
            }
        };
        AccountPet.prototype.getAccount = function () {
            var _this = this;
            var request = {};
            services.server.get(routes.account.getAccount, request).then(function (response) {
                _this.getAccountCb(response);
            });
        };
        AccountPet.prototype.getAccountCb = function (response) {
            if (!response.error) {
                this.model.name(response.name);
                this.model.type(response.type);
                this.model.breed(response.breed);
                this.model.birthday(response.birthday);
                this.model.about(response.about);
                this.model.picture(response.picture);
                this.model.logo(response.logo);
            }
        };
        AccountPet.prototype.getSaveRequest = function () {
            return {
                name: this.model.name(),
                type: this.model.type(),
                breed: this.model.breed(),
                birthday: this.model.birthday(),
                about: this.model.about()
            };
        };
        AccountPet.prototype.saveCb = function (response) {
            if (!response.error) {
                services.ui.showAlert({
                    msg: window.mltId.alert_save_success,
                    type: 0,
                    icon: 'fa-check'
                });
                services.currentAccount.getCurrentUser();
            }
            else {
                services.ui.showAlert({
                    msg: window.mltId.server_error_default,
                    type: 3,
                    icon: 'fa-exclamation'
                });
            }
        };
        return AccountPet;
    })();
    var AccountPetType = (function () {
        function AccountPetType(type, selectedValue) {
            var _this = this;
            this.value = type.value;
            this.name = type.name;
            this.isSelected = ko.computed(function () { return _this.value === selectedValue(); });
            this.css = services.ui.getClassForPetType(this.value);
        }
        return AccountPetType;
    })();
    return AccountPet;
});
//# sourceMappingURL=accountPet.js.map