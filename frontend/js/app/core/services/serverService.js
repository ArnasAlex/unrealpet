define(["require", "exports", 'plugins/http', '../../routes'], function (require, exports, http, routes) {
    var ServerService = (function () {
        function ServerService() {
            this.routes = routes;
        }
        ServerService.prototype.init = function (ui, nav, currentAccount) {
            this.ui = ui;
            this.nav = nav;
            this.currentAccount = currentAccount;
        };
        ServerService.prototype.get = function (route, data) {
            var _this = this;
            var getPromise = http.get(route, data);
            getPromise.fail(function (response) {
                _this.handleErrors(response.status);
            });
            return getPromise;
        };
        ServerService.prototype.post = function (route, data) {
            var _this = this;
            var postPromise = http.post(route, data);
            postPromise.fail(function (response) {
                _this.handleErrors(response.status);
            });
            return postPromise;
        };
        ServerService.prototype.handleErrors = function (status) {
            switch (status) {
                case 401:
                    this.handleUnauthenticated();
                    break;
                case 403:
                    this.handleUnauthorized();
                    break;
            }
        };
        ServerService.prototype.handleUnauthenticated = function () {
            var _this = this;
            if (this.currentAccount.isAuthenticated()) {
                this.currentAccount.getCurrentUser();
                return;
            }
            this.ui.showMessage({
                msg: window.mltId.error_unauthenticated_msg,
                title: window.mltId.error_unauthenticated_title,
                showSecondButton: true,
                closeCb: function (result) {
                    if (result === 1 /* Primary */) {
                        _this.nav.goTo(3 /* Login */);
                    }
                },
                primaryBtnLbl: window.mltId.login_login
            });
        };
        ServerService.prototype.handleUnauthorized = function () {
            this.nav.goTo(1 /* Home */);
        };
        return ServerService;
    })();
    exports.ServerService = ServerService;
});
//# sourceMappingURL=serverService.js.map