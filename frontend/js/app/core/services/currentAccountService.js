define(["require", "exports", 'knockout', 'plugins/http', '../../routes'], function (require, exports, ko, http, routes) {
    var CurrentAccountService = (function () {
        function CurrentAccountService() {
            var _this = this;
            this.currentUser = ko.observable(null);
            this.hasActivities = ko.observable(false);
            this.updateCheckInterval = 5000;
            this.logout = function () {
                _this.server.get(routes.auth.logout, {}).then(function () {
                    _this.getCurrentUser(function () {
                        _this.nav.goTo(1 /* Home */);
                    });
                });
            };
            this.reloadMlt = function (user) {
                if (user.isAuthenticated && user.language != 0 /* NotDefined */ && _this.mlt.language !== user.language) {
                    var cb = function () {
                        window.location.reload(false);
                    };
                    _this.mlt.load(cb);
                }
            };
            this.checkForUpdates = function () {
                if (!_this.currentUser().isAuthenticated) {
                    if (_this.updateCheckerId) {
                        clearTimeout(_this.updateCheckerId);
                    }
                    return;
                }
                _this.decideCheckInterval();
                _this.updateCheckerId = setTimeout(function () {
                    _this.server.get(routes.activity.getUpdates, {}).then(function (response) {
                        _this.lastUpdate = response;
                        _this.hasActivities(response.hasActivities);
                        var isValid = _this.validateApplicationVersion(response.version);
                        if (isValid) {
                            _this.checkForUpdates();
                        }
                    }).fail(function (response) {
                        if (response.status !== 401) {
                            _this.checkForUpdates();
                        }
                    });
                }, _this.updateCheckInterval);
            };
            this.isAuthenticated = ko.computed(function () {
                var user = _this.currentUser();
                return user && user.isAuthenticated;
            });
        }
        CurrentAccountService.prototype.init = function (mlt, nav, server, ui) {
            this.mlt = mlt;
            this.nav = nav;
            this.server = server;
            this.ui = ui;
        };
        CurrentAccountService.prototype.getCurrentUser = function (cb) {
            var _this = this;
            http.get(routes.general.getCurrentUser, {}).then(function (response) {
                _this.getCurrentUserCb(response);
                if (cb) {
                    cb();
                }
            });
        };
        CurrentAccountService.prototype.postAdded = function () {
            this.currentUser().postCount++;
        };
        CurrentAccountService.prototype.getCurrentUserCb = function (response) {
            if (!response.error) {
                var user = response.user;
                this.currentUser(user);
                this.reloadMlt(user);
                this.checkForUpdates();
            }
        };
        CurrentAccountService.prototype.decideCheckInterval = function () {
            if (!this.lastUpdate || this.lastUpdate.hasActivities != this.hasActivities()) {
                this.updateCheckInterval = 1000 * 5;
                return;
            }
            this.updateCheckInterval = 1000 * 10;
        };
        CurrentAccountService.prototype.validateApplicationVersion = function (backendVersion) {
            if (!CurrentAccountService.frontendVersion) {
                var fileUrl = $('script[src*="bust=v"]').first().attr('src');
                var fullVersion = fileUrl.split('bust=v')[1];
                var split = fullVersion.split('.');
                split = split.slice(0, 3);
                CurrentAccountService.frontendVersion = split.join('.');
            }
            var isSameVersions = backendVersion === CurrentAccountService.frontendVersion || backendVersion === 'develop';
            if (!isSameVersions) {
                this.ui.showMessage({
                    msg: window.mltId.update_version_msg,
                    title: window.mltId.update_version_title,
                    closeCb: function (result) {
                        window.location.reload();
                    }
                });
                return false;
            }
            return true;
        };
        return CurrentAccountService;
    })();
    exports.CurrentAccountService = CurrentAccountService;
});
//# sourceMappingURL=currentAccountService.js.map