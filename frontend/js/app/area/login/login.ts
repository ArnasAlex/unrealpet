/// <reference path='../../../typings/refs.d.ts' />
import ko = require('knockout');
import routes = require('../../routes');
import services = require('../../core/services/services');

class Login {

    email = ko.observable('');
    password = ko.observable('');
    serverError = ko.observable('');
    isEmailFormOpen = ko.observable(false);

    validator: KnockoutValidationGroup = ko.validatedObservable({
        email: this.email,
        password: this.password
    });

    constructor() {
    }

    activate() {
        this.email.extend({
            email: {message: window.mltId.login_email_enter_proper},
            required: {message: window.mltId.login_email_enter}
        });

        this.password.extend({
            required: {message: window.mltId.login_password_enter}
        });
    }

    login(){
        if (this.validator.isValid()){
            var request = this.getLoginRequest();
            services.server.post(routes.auth.login, request).then((response) => {
                this.loginCb(response);
            });
        }
        else{
            this.validator.errors.showAllMessages();
        }
    }

    loginCb(response: ILoginResponse){
        if (response.error) {
            var errMsg = services.mlt.translate(response.error);
            this.serverError(errMsg);
        }
        else {
            services.currentAccount.getCurrentUser();
            services.nav.goTo(Routes.Home);
        }
    }

    openEmailSection = () => {
        this.isEmailFormOpen(!this.isEmailFormOpen());
    };

    private getLoginRequest(): ILoginRequest{
        return {
            email: this.email(),
            password: this.password()
        }
    }
}

export = Login;