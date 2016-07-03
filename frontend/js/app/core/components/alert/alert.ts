/// <reference path='../../../../typings/refs.d.ts' />
import ko = require('knockout');
import services = require('../../services/services');

class Alert {
    message = ko.observable('');
    isVisible = ko.observable(false);
    typeClass = ko.observable('');
    icon = ko.observable('');

    private options: IAlertOptions;

    constructor(){
        this.bindToUiService();
    }

    compositionComplete(){
    }

    hide(){
        this.isVisible(false);
    }

    private bindToUiService(){
        services.ui.registerAlertComponent(this.alertAdded);
    }

    private alertAdded = (options: IAlertOptions) => {
        this.options = options;
        this.showAlert();
    };

    private showAlert() {
        this.message(this.options.msg);
        var classOfType = this.getClassByType(this.options.type);
        this.typeClass(classOfType);
        this.icon(this.options.icon);

        this.animate();
    }

    private animate() {
        var alert = $('#alert');
        alert.css('bottom', '50%');
        this.isVisible(true);

        var delay = this.options.waitLonger ? 5000 : 1000;
        alert
            .velocity('fadeIn')
            .velocity({bottom: '0', opacity: '0.2'}, {duration: 1500, delay: delay, complete: () => {
                this.isVisible(false);
            }});
    }

    private getClassByType(type: AlertType){
        switch(type){
            case AlertType.Info:
                return 'alert-info';
            case AlertType.Warning:
                return 'alert-warning';
            case AlertType.Success:
                return 'alert-success';
            case AlertType.Danger:
                return 'alert-danger';
        }

        return '';
    }
}

export = Alert;