define(["require", "exports", 'knockout', '../../routes'], function (require, exports, ko, routes) {
    var AccountPictureUpload = (function () {
        function AccountPictureUpload(list) {
            this.progress = ko.observable(0);
            this.selectedPictureType = ko.observable(2);
            this.pictureDetails = ko.observable();
            this.pictureDetailsList = [];
            this.pictureUrl = ko.observable();
            this.pictureDetailsList = list;
            this.updateSelectedPictureDetails();
            this.init();
        }
        AccountPictureUpload.prototype.init = function () {
            var _this = this;
            this.isPictureUploaded = ko.computed(function () {
                var pic = _this.pictureDetails().url();
                return pic && pic.length > 0;
            });
            this.btnText = ko.computed(function () {
                return _this.isPictureUploaded() ? window.mltId.account_change_picture : window.mltId.account_upload;
            });
            this.data = ko.computed(function () {
                return { type: _this.pictureDetails().type };
            });
            this.options = {
                btnText: this.btnText,
                uploadUrl: routes.account.uploadAccountPicture,
                uploadCb: function (response) { _this.pictureDetails().url(response.pictureUrl); },
                progress: this.progress,
                data: this.data,
                fileType: 1
            };
        };
        AccountPictureUpload.prototype.changeSelectedPicture = function (type) {
            this.selectedPictureType(type);
            this.updateSelectedPictureDetails();
        };
        AccountPictureUpload.prototype.updateSelectedPictureDetails = function () {
            this.pictureDetails(this.pictureDetailsList[this.selectedPictureType()]);
            this.pictureUrl(this.pictureDetails().url());
        };
        return AccountPictureUpload;
    })();
    exports.AccountPictureUpload = AccountPictureUpload;
});
//# sourceMappingURL=accountPictureUpload.js.map