define(["require", "exports", 'knockout', '../../core/services/services', '../../routes'], function (require, exports, ko, services, routes) {
    var Home = (function () {
        function Home() {
            var _this = this;
            this.topSection = ko.observable(1 /* Login */);
            this.setTopSectionByUser = function (user) {
                if (!user || !user.isAuthenticated) {
                    _this.topSection(1 /* Login */);
                    return;
                }
                if (user.postCount == 0) {
                    _this.topSection(2 /* AddPost */);
                    return;
                }
                if (user.name && user.name.toLowerCase().indexOf('unrealpet') !== -1) {
                    _this.topSection(3 /* ChangeName */);
                    return;
                }
                _this.topSection(2 /* AddPost */);
            };
            this.startTopSectionAnimation = function () {
                _this.animationId = setTimeout(function () {
                    var firstButton = $('.home .top-section > div:not([style*="display: none"]) .btn:first');
                    if (firstButton.queue().length === 0) {
                        var animations = ['callout.pulse', 'callout.swing', 'callout.bounce'];
                        var rand = Math.floor(Math.random() * 3);
                        firstButton.velocity(animations[rand]);
                    }
                    _this.startTopSectionAnimation();
                }, 3000);
            };
            this.stopTopSectionAnimation = function () {
                clearTimeout(_this.animationId);
            };
        }
        Home.prototype.activate = function () {
            this.init();
        };
        Home.prototype.bindingComplete = function () {
            this.startTopSectionAnimation();
        };
        Home.prototype.deactivate = function () {
            this.gridOptions.component.destroy();
            this.stopTopSectionAnimation();
        };
        Home.prototype.init = function () {
            this.setTopSectionByUser(services.currentAccount.currentUser());
            services.currentAccount.currentUser.subscribe(this.setTopSectionByUser);
            this.gridOptions = {
                component: null,
                url: routes.post.getPosts,
                getRequest: null
            };
            this.voteGameOptions = {
                showPlayButton: true,
                energyChangedCb: null,
                refreshEnergy: null
            };
        };
        return Home;
    })();
    return Home;
});
//# sourceMappingURL=home.js.map