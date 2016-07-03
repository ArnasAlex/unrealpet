/// <reference path="../../../typings/refs.d.ts" />
import router = require('plugins/router');

export class NavService {
    private routes: string[] = [];

    constructor(){
        this.initRoutes();
    }

    private initRoutes(){
        this.routes[Routes.Home] = '';
        this.routes[Routes.Signup] = 'signup';
        this.routes[Routes.Login] = 'login';
        this.routes[Routes.Account] = 'account';
        this.routes[Routes.AddPost] = 'addpost';
        this.routes[Routes.Admin] = 'admin';
        this.routes[Routes.Terms] = 'terms';
        this.routes[Routes.Posts] = 'posts(/:id)';
        this.routes[Routes.Post] = 'post/:id';
        this.routes[Routes.Game] = 'game';
    }

    goTo(route: Routes){
        var routeName = this.getRouteValue(route);
        router.navigate(routeName);
    }

    goToUrl(url: string){
        router.navigate(url);
    }

    getRouteValue(route: Routes){
        return this.routes[route];
    }

    getRoutingConfig(): Array<DurandalRouteConfiguration> {
        return [
            { route: this.getRouteValue(Routes.Home), title: 'Home', moduleId: 'area/home/home', nav: true },
            { route: this.getRouteValue(Routes.Login), title: 'Login', moduleId: 'area/login/login', nav: true },
            { route: this.getRouteValue(Routes.Signup), title: 'SignUp', moduleId: 'area/login/signup', nav: true },
            { route: this.getRouteValue(Routes.Account), title: 'Account', moduleId: 'area/account/account', nav: true },
            { route: this.getRouteValue(Routes.AddPost), title: 'Add Post', moduleId: 'area/post/addPost', nav: true },
            { route: this.getRouteValue(Routes.Admin), title: 'Admin', moduleId: 'area/admin/admin', nav: true },
            { route: this.getRouteValue(Routes.Terms), title: 'Terms', moduleId: 'area/info/terms', nav: true },
            { route: this.getRouteValue(Routes.Posts), title: 'Posts', moduleId: 'area/post/posts', nav: true },
            { route: this.getRouteValue(Routes.Post), title: 'Post', moduleId: 'area/post/post', nav: true },
            { route: this.getRouteValue(Routes.Game), title: 'Game', moduleId: 'area/game/game', nav: true }
        ];
    }
}