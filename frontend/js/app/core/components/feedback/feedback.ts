/// <reference path='../../../../typings/refs.d.ts' />
import ko = require('knockout');
import services = require('../../services/services');
import routes = require('../../../routes');

class Feedback {
    private modalSelector = '#feedback';
    message = ko.observable('');
    isHappy = ko.observable(true);

    constructor(){
    }

    compositionComplete(){
        this.bindEvents();
    }

    save = () => {
        if (!this.message()){
            return;
        }

        var req: ISaveFeedbackRequest = {
            message: this.message(),
            isHappy: this.isHappy()
        };

        services.server.post(routes.general.saveFeedback, req).then(() =>{
            services.ui.showAlert({
                msg: window.mltId.alert_save_success,
                type: AlertType.Success,
                icon: 'fa-check'
            });
        });
    };

    happy = () => {
        this.isHappy(true);
    };

    sad = () => {
        this.isHappy(false);
    };

    private bindEvents(){
        $(this.modalSelector).on('show.bs.modal', (e) => { this.clear(); });
    }

    private clear = () => {
        this.message('');
        this.isHappy(true);
    };
}

export = Feedback;