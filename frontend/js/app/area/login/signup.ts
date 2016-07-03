/// <reference path='../../../typings/refs.d.ts' />
import ko = require('knockout');
import routes = require('../../routes');
import services = require('../../core/services/services');

class SignUp {

    email = ko.observable('').extend({
        email: {message: window.mltId.login_email_enter_proper},
        required: {message: window.mltId.login_email_enter}
    });
    password = ko.observable('').extend({
        required: {message: window.mltId.login_password_enter},
        minLength: {params: 6, message: window.mltId.login_password_to_short}
    });
    repeatPassword = ko.observable('').extend({
        required: {message: window.mltId.login_repeat_password_enter},
        areSame: {params: this.password, message: window.mltId.login_repeat_password_not_match}
    });
    serverError = ko.observable('');

    validator: KnockoutValidationGroup = ko.validatedObservable({
        email: this.email,
        password: this.password,
        repeatPassword: this.repeatPassword
    });

    signUp(){
        if (this.validator.isValid()){
            var request = this.getSignUpRequest();
            services.server.post(routes.auth.signup, request).then((response) => {
                this.signUpCb(response);
            });
        }
        else{
            this.validator.errors.showAllMessages();
        }
    }

    signUpCb(response: ISignUpResponse){
        if (response.error){
            var errMsg = services.mlt.translate(response.error);
            this.serverError(errMsg);
        }
        else{
            services.ui.showMessage({
                msg: window.mltId.login_success_signup_msg,
                title: window.mltId.login_success_signup_title,
                closeCb: () => { services.nav.goTo(Routes.Login); }
            });
        }
    }

    private getSignUpRequest(): ISignUpRequest{
        return {
            email: this.email(),
            password: this.password()
        }
    }
}

export = SignUp;