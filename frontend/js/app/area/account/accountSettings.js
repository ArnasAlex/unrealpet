define(["require", "exports", 'knockout', '../../routes', '../../core/services/services'], function (require, exports, ko, routes, services) {
    var AccountSettings = (function () {
        function AccountSettings() {
            this.languages = [
                { id: 1, text: 'English' },
                { id: 2, text: 'Lietuvių' }
            ];
            this.model = {
                language: ko.observable(1),
                email: ko.observable()
            };
        }
        AccountSettings.prototype.activate = function () {
            this.getAccountSettings();
        };
        AccountSettings.prototype.logout = function () {
            services.server.get(routes.auth.logout, {}).then(function () {
                services.currentAccount.getCurrentUser(function () {
                    services.nav.goTo(1);
                });
            });
        };
        AccountSettings.prototype.save = function () {
            var _this = this;
            var request = this.getSaveRequest();
            services.server.post(routes.account.saveAccountSettings, request).then(function (response) {
                _this.saveCb(response);
            });
        };
        AccountSettings.prototype.getAccountSettings = function () {
            var _this = this;
            var request = {};
            services.server.get(routes.account.getAccountSettings, request).then(function (response) {
                _this.getAccountSettingsCb(response);
            });
        };
        AccountSettings.prototype.getAccountSettingsCb = function (response) {
            if (!response.error) {
                this.model.language(response.language);
                this.model.email(response.email);
            }
        };
        AccountSettings.prototype.getSaveRequest = function () {
            return {
                language: this.model.language()
            };
        };
        AccountSettings.prototype.saveCb = function (response) {
            if (!response.error) {
                this.checkForLanguageChange();
                services.ui.showAlert({
                    msg: window.mltId.alert_save_success,
                    type: 0,
                    icon: 'fa-check'
                });
            }
            else {
                services.ui.showAlert({
                    msg: window.mltId.server_error_default,
                    type: 3,
                    icon: 'fa-exclamation'
                });
            }
        };
        AccountSettings.prototype.checkForLanguageChange = function () {
            if (services.mlt.language != this.model.language()) {
                var cb = function () {
                    window.location.reload(false);
                };
                services.mlt.load(cb);
            }
        };
        return AccountSettings;
    })();
    return AccountSettings;
});
//# sourceMappingURL=accountSettings.js.map