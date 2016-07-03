define(["require", "exports", 'knockout', '../../routes', '../../core/services/services'], function (require, exports, ko, routes, services) {
    var Login = (function () {
        function Login() {
            var _this = this;
            this.email = ko.observable('');
            this.password = ko.observable('');
            this.serverError = ko.observable('');
            this.isEmailFormOpen = ko.observable(false);
            this.validator = ko.validatedObservable({
                email: this.email,
                password: this.password
            });
            this.openEmailSection = function () {
                _this.isEmailFormOpen(!_this.isEmailFormOpen());
            };
        }
        Login.prototype.activate = function () {
            this.email.extend({
                email: { message: window.mltId.login_email_enter_proper },
                required: { message: window.mltId.login_email_enter }
            });
            this.password.extend({
                required: { message: window.mltId.login_password_enter }
            });
        };
        Login.prototype.login = function () {
            var _this = this;
            if (this.validator.isValid()) {
                var request = this.getLoginRequest();
                services.server.post(routes.auth.login, request).then(function (response) {
                    _this.loginCb(response);
                });
            }
            else {
                this.validator.errors.showAllMessages();
            }
        };
        Login.prototype.loginCb = function (response) {
            if (response.error) {
                var errMsg = services.mlt.translate(response.error);
                this.serverError(errMsg);
            }
            else {
                services.currentAccount.getCurrentUser();
                services.nav.goTo(1);
            }
        };
        Login.prototype.getLoginRequest = function () {
            return {
                email: this.email(),
                password: this.password()
            };
        };
        return Login;
    })();
    return Login;
});
//# sourceMappingURL=login.js.map