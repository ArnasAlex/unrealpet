/// <reference path='../../../../typings/refs.d.ts' />
import ko = require('knockout');
import services = require('../../services/services');

class Modal {
    private modalSelector = '#modal';
    private values: IModalOptions;
    private result: ModalResult;

    message = ko.observable('');
    title = ko.observable('');
    showSecondButton = ko.observable(false);
    primaryBtnLbl = ko.observable('');
    secondaryBtnLbl = ko.observable('');

    constructor(){
    }

    compositionComplete(){
        this.bindEvents();
        this.setReady();
    }

    primaryBtnClicked(){
        this.result = ModalResult.Primary;
    }

    secondaryBtnClicked(){
        this.result = ModalResult.Secondary;
    }

    private bindEvents(){
        $(this.modalSelector).on('show.bs.modal', (e) => { this.fillModal(); });
        $(this.modalSelector).on('hidden.bs.modal', (e) => { this.hideModalCb(); })
    }

    private fillModal(){
        this.values = services.ui.getModalValues();
        this.message(this.values.msg);
        this.title(this.values.title);
        this.showSecondButton(this.values.showSecondButton);
        this.primaryBtnLbl(this.values.primaryBtnLbl ? this.values.primaryBtnLbl : window.mltId.control_ok);
        this.secondaryBtnLbl(this.values.secondaryBtnLbl ? this.values.secondaryBtnLbl : window.mltId.control_cancel);
        this.result = ModalResult.NotSet;
    }

    private hideModalCb(){
        if (this.values.closeCb){
            if (this.result === ModalResult.NotSet){
                this.result = ModalResult.Close;
            }

            this.values.closeCb(this.result);
        }
    }

    private setReady(){
        $(this.modalSelector).attr('data-ready', 'true');
    }
}

export = Modal;