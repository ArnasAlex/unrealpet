define(["require", "exports", 'knockout', '../../services/services'], function (require, exports, ko, services) {
    var Modal = (function () {
        function Modal() {
            this.modalSelector = '#modal';
            this.message = ko.observable('');
            this.title = ko.observable('');
            this.showSecondButton = ko.observable(false);
            this.primaryBtnLbl = ko.observable('');
            this.secondaryBtnLbl = ko.observable('');
        }
        Modal.prototype.compositionComplete = function () {
            this.bindEvents();
            this.setReady();
        };
        Modal.prototype.primaryBtnClicked = function () {
            this.result = 1;
        };
        Modal.prototype.secondaryBtnClicked = function () {
            this.result = 2;
        };
        Modal.prototype.bindEvents = function () {
            var _this = this;
            $(this.modalSelector).on('show.bs.modal', function (e) { _this.fillModal(); });
            $(this.modalSelector).on('hidden.bs.modal', function (e) { _this.hideModalCb(); });
        };
        Modal.prototype.fillModal = function () {
            this.values = services.ui.getModalValues();
            this.message(this.values.msg);
            this.title(this.values.title);
            this.showSecondButton(this.values.showSecondButton);
            this.primaryBtnLbl(this.values.primaryBtnLbl ? this.values.primaryBtnLbl : window.mltId.control_ok);
            this.secondaryBtnLbl(this.values.secondaryBtnLbl ? this.values.secondaryBtnLbl : window.mltId.control_cancel);
            this.result = 0;
        };
        Modal.prototype.hideModalCb = function () {
            if (this.values.closeCb) {
                if (this.result === 0) {
                    this.result = 3;
                }
                this.values.closeCb(this.result);
            }
        };
        Modal.prototype.setReady = function () {
            $(this.modalSelector).attr('data-ready', 'true');
        };
        return Modal;
    })();
    return Modal;
});
//# sourceMappingURL=modal.js.map