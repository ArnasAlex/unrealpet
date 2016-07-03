define(["require", "exports", 'plugins/router', 'knockout', '../../core/services/services', 'jquery'], function (require, exports, router, ko, services, $) {
    var Shell = (function () {
        function Shell() {
            var _this = this;
            this.user = ko.computed(function () {
                return services.currentAccount.currentUser();
            });
            this.hasActivities = ko.observable(false);
            this.menuItems = ko.observableArray();
            this.selectedMenuItem = ko.observable();
            this.titleClicked = function () {
                var url = '#home';
                if (_this.user().isAuthenticated) {
                    url = '#posts';
                }
                services.nav.goToUrl(url);
            };
            this.updateTitle = function (instance, instruction) {
            };
            services.currentAccount.hasActivities.subscribe(function (newVal) {
                if (newVal && !_this.hasActivities()) {
                    setTimeout(function () {
                        services.ui.animateBell();
                    });
                }
                _this.hasActivities(newVal);
            });
        }
        Shell.prototype.activate = function () {
            this.initMenuItems();
            return this.setupRouting();
        };
        Shell.prototype.initMenuItems = function () {
            var _this = this;
            var userAuthenticated = ko.computed(function () {
                var user = _this.user();
                return user && user.isAuthenticated;
            });
            var userNotAuthenticated = ko.computed(function () {
                var user = _this.user();
                return !user || !user.isAuthenticated;
            });
            var goTo = function (url) {
                return function () {
                    services.nav.goToUrl(url);
                };
            };
            var home = {
                buttonMlt: 'menu_home',
                icon: 'fa-book',
                visible: true,
                click: goTo('#'),
                hash: '#'
            };
            var myPosts = {
                buttonMlt: 'menu_my_posts',
                icon: 'fa-home',
                visible: userAuthenticated,
                click: goTo('#posts'),
                hash: '#posts'
            };
            var game = {
                buttonMlt: 'menu_game',
                icon: 'fa-gamepad',
                visible: true,
                click: goTo('#game'),
                hash: '#game'
            };
            var settings = {
                buttonMlt: 'menu_account',
                icon: 'fa-user',
                visible: userAuthenticated,
                click: goTo('#account'),
                hash: '#account'
            };
            var feedback = {
                buttonMlt: 'menu_feedback',
                icon: 'fa-smile-o',
                visible: true,
                click: this.showFeedback
            };
            var login = {
                buttonMlt: 'menu_login',
                icon: 'fa-sign-in',
                visible: userNotAuthenticated,
                click: goTo('#login'),
                hash: '#login'
            };
            var logout = {
                buttonMlt: 'menu_logout',
                icon: 'fa-sign-out',
                visible: userAuthenticated,
                click: services.currentAccount.logout
            };
            var items = [home, myPosts, game, settings, feedback, login, logout];
            this.menuItems(items);
            this.selectedMenuItem(home);
            this.bindToNavigation();
        };
        Shell.prototype.setupRouting = function () {
            var routes = services.nav.getRoutingConfig();
            router.map(routes);
            router.buildNavigationModel();
            var homeRoute = routes[0];
            router.mapUnknownRoutes(homeRoute);
            router.updateDocumentTitle = this.updateTitle;
            return router.activate();
        };
        Shell.prototype.bindToNavigation = function () {
            var _this = this;
            router.on("router:route:activating", function (viewModel, routeInstruction) {
                var hash = routeInstruction.config.hash;
                var item = _this.getMenuItemByHash(hash);
                if (item.hash !== _this.selectedMenuItem().hash) {
                    _this.selectedMenuItem(item);
                }
            });
        };
        Shell.prototype.getMenuItemByHash = function (hash) {
            var items = this.menuItems();
            var home = items[0];
            var item = _.find(items, function (x) { return hash.indexOf(x.hash) !== -1 && x.hash !== home.hash; });
            if (!item) {
                item = home;
            }
            return item;
        };
        Shell.prototype.showFeedback = function () {
            $('#feedback').modal('show');
        };
        return Shell;
    })();
    return Shell;
});
//# sourceMappingURL=shell.js.map