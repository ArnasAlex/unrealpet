/// <reference path='../../../typings/refs.d.ts' />
import ko = require('knockout');
import routes = require('../../routes');
import services = require('../../core/services/services');

class AccountSettings {

    languages: ILanguage[] = [
        {id: Language.English, text: 'English'},
        {id: Language.Lithuanian, text: 'Lietuvių'}
    ];
    model = {
        language: ko.observable(Language.English),
        email: ko.observable()
    };

    constructor() {
    }

    activate() {
        this.getAccountSettings();
    }

    logout() {
        services.server.get(routes.auth.logout, {}).then(() => {
            services.currentAccount.getCurrentUser(() => {
                services.nav.goTo(Routes.Home);
            });
        });
    }

    save() {
        var request = this.getSaveRequest();
        services.server.post(routes.account.saveAccountSettings, request).then((response) => {
            this.saveCb(response);
        });
    }

    private getAccountSettings(){
        var request: IGetAccountSettingsRequest = {};
        services.server.get(routes.account.getAccountSettings, request).then((response) => {
            this.getAccountSettingsCb(response);
        })
    }

    private getAccountSettingsCb(response: IGetAccountSettingsResponse){
        if (!response.error){
            this.model.language(response.language);
            this.model.email(response.email);
        }
    }

    private getSaveRequest(): ISaveAccountSettingsRequest{
        return {
            language: this.model.language()
        };
    }

    private saveCb(response: ISaveAccountResponse){
        if (!response.error) {
            this.checkForLanguageChange();

            services.ui.showAlert(
                {
                    msg: window.mltId.alert_save_success,
                    type: AlertType.Success,
                    icon: 'fa-check'
                });
        } else {
            services.ui.showAlert(
                {
                    msg: window.mltId.server_error_default,
                    type: AlertType.Danger,
                    icon: 'fa-exclamation'
                });
        }
    }

    private checkForLanguageChange(){
        if (services.mlt.language != this.model.language()){
            var cb = () => {
                window.location.reload(false);
            };
            services.mlt.load(cb);
        }
    }
}

interface ILanguage {
    id: Language;
    text: string;
}

export = AccountSettings;