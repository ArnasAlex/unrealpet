define(["require", "exports", 'durandal/app', 'durandal/viewLocator', './core/knockout/KnockoutExtensions', 'durandal/system', './area/shell/shell', './core/services/services'], function (require, exports, app, viewLocator, koEx, system, shell, services) {
    shell;
    var Main = (function () {
        function Main() {
            var _this = this;
            app.title = 'Unreal Pet';
            app.configurePlugins({
                router: true
            });
            koEx.KnockoutExtensions.init();
            services.init();
            app.start().then(function () {
                return _this.getMultilang();
            }).then(function () {
                return _this.loadUser();
            }).then(function () {
                viewLocator.useConvention();
                app.setRoot('area/shell/shell');
            });
            var enableDebug = window.location.hostname == 'localhost';
            system.debug(enableDebug);
        }
        Main.prototype.getMultilang = function () {
            var def = $.Deferred();
            services.mlt.load(def.resolve);
            return def.promise();
        };
        Main.prototype.loadUser = function () {
            var def = $.Deferred();
            services.currentAccount.getCurrentUser(def.resolve);
            return def.promise();
        };
        return Main;
    })();
    exports.Main = Main;
});
//# sourceMappingURL=main.js.map