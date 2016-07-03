define(["require", "exports", 'knockout', '../../routes', '../../core/services/services'], function (require, exports, ko, routes, services) {
    var SignUp = (function () {
        function SignUp() {
            this.email = ko.observable('').extend({
                email: { message: window.mltId.login_email_enter_proper },
                required: { message: window.mltId.login_email_enter }
            });
            this.password = ko.observable('').extend({
                required: { message: window.mltId.login_password_enter },
                minLength: { params: 6, message: window.mltId.login_password_to_short }
            });
            this.repeatPassword = ko.observable('').extend({
                required: { message: window.mltId.login_repeat_password_enter },
                areSame: { params: this.password, message: window.mltId.login_repeat_password_not_match }
            });
            this.serverError = ko.observable('');
            this.validator = ko.validatedObservable({
                email: this.email,
                password: this.password,
                repeatPassword: this.repeatPassword
            });
        }
        SignUp.prototype.signUp = function () {
            var _this = this;
            if (this.validator.isValid()) {
                var request = this.getSignUpRequest();
                services.server.post(routes.auth.signup, request).then(function (response) {
                    _this.signUpCb(response);
                });
            }
            else {
                this.validator.errors.showAllMessages();
            }
        };
        SignUp.prototype.signUpCb = function (response) {
            if (response.error) {
                var errMsg = services.mlt.translate(response.error);
                this.serverError(errMsg);
            }
            else {
                services.ui.showMessage({
                    msg: window.mltId.login_success_signup_msg,
                    title: window.mltId.login_success_signup_title,
                    closeCb: function () { services.nav.goTo(3); }
                });
            }
        };
        SignUp.prototype.getSignUpRequest = function () {
            return {
                email: this.email(),
                password: this.password()
            };
        };
        return SignUp;
    })();
    return SignUp;
});
//# sourceMappingURL=signup.js.map