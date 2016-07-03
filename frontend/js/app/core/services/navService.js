define(["require", "exports", 'plugins/router'], function (require, exports, router) {
    var NavService = (function () {
        function NavService() {
            this.routes = [];
            this.initRoutes();
        }
        NavService.prototype.initRoutes = function () {
            this.routes[1 /* Home */] = '';
            this.routes[2 /* Signup */] = 'signup';
            this.routes[3 /* Login */] = 'login';
            this.routes[4 /* Account */] = 'account';
            this.routes[5 /* AddPost */] = 'addpost';
            this.routes[6 /* Admin */] = 'admin';
            this.routes[7 /* Terms */] = 'terms';
            this.routes[8 /* Posts */] = 'posts(/:id)';
            this.routes[9 /* Post */] = 'post/:id';
            this.routes[10 /* Game */] = 'game';
        };
        NavService.prototype.goTo = function (route) {
            var routeName = this.getRouteValue(route);
            router.navigate(routeName);
        };
        NavService.prototype.goToUrl = function (url) {
            router.navigate(url);
        };
        NavService.prototype.getRouteValue = function (route) {
            return this.routes[route];
        };
        NavService.prototype.getRoutingConfig = function () {
            return [
                { route: this.getRouteValue(1 /* Home */), title: 'Home', moduleId: 'area/home/home', nav: true },
                { route: this.getRouteValue(3 /* Login */), title: 'Login', moduleId: 'area/login/login', nav: true },
                { route: this.getRouteValue(2 /* Signup */), title: 'SignUp', moduleId: 'area/login/signup', nav: true },
                { route: this.getRouteValue(4 /* Account */), title: 'Account', moduleId: 'area/account/account', nav: true },
                { route: this.getRouteValue(5 /* AddPost */), title: 'Add Post', moduleId: 'area/post/addPost', nav: true },
                { route: this.getRouteValue(6 /* Admin */), title: 'Admin', moduleId: 'area/admin/admin', nav: true },
                { route: this.getRouteValue(7 /* Terms */), title: 'Terms', moduleId: 'area/info/terms', nav: true },
                { route: this.getRouteValue(8 /* Posts */), title: 'Posts', moduleId: 'area/post/posts', nav: true },
                { route: this.getRouteValue(9 /* Post */), title: 'Post', moduleId: 'area/post/post', nav: true },
                { route: this.getRouteValue(10 /* Game */), title: 'Game', moduleId: 'area/game/game', nav: true }
            ];
        };
        return NavService;
    })();
    exports.NavService = NavService;
});
//# sourceMappingURL=navService.js.map