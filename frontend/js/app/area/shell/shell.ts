import router = require('plugins/router');
import system = require('durandal/system');
import ko = require('knockout');
import services = require('../../core/services/services');
import $ = require('jquery');
import routes = require('../../routes');
import app = require('durandal/app');

class Shell {
    user = ko.computed(() => {
       return services.currentAccount.currentUser();
    });
    hasActivities = ko.observable(false);

    menuItems = ko.observableArray<IMenuItem>();
    selectedMenuItem = ko.observable<IMenuItem>();

    constructor() {
        services.currentAccount.hasActivities.subscribe((newVal: boolean) => {
            if (newVal && !this.hasActivities()){
                setTimeout(() => {
                    services.ui.animateBell();
                });
            }
            this.hasActivities(newVal);
        });
    }

    activate() {
        this.initMenuItems();
        return this.setupRouting();
    }

    titleClicked = () => {
        var url = '#home';
        if (this.user().isAuthenticated){
            url = '#posts';
        }

        services.nav.goToUrl(url);
    };

    private initMenuItems(){
        var userAuthenticated = ko.computed(() => {
            var user = this.user();
            return user && user.isAuthenticated;
        });

        var userNotAuthenticated = ko.computed(() => {
            var user = this.user();
            return !user || !user.isAuthenticated;
        });

        var goTo = (url): Function => {
            return () => {
                services.nav.goToUrl(url)
            };
        };

        var home: IMenuItem = {
            buttonMlt: 'menu_home',
            icon: 'fa-book',
            visible: true,
            click: goTo('#'),
            hash: '#'
        };

        var myPosts: IMenuItem = {
            buttonMlt: 'menu_my_posts',
            icon: 'fa-home',
            visible: userAuthenticated,
            click: goTo('#posts'),
            hash: '#posts'
        };

        var game: IMenuItem = {
            buttonMlt: 'menu_game',
            icon: 'fa-gamepad',
            visible: true,
            click: goTo('#game'),
            hash: '#game'
        };

        var settings: IMenuItem = {
            buttonMlt: 'menu_account',
            icon: 'fa-user',
            visible: userAuthenticated,
            click: goTo('#account'),
            hash: '#account'
        };

        var feedback: IMenuItem = {
            buttonMlt: 'menu_feedback',
            icon: 'fa-smile-o',
            visible: true,
            click: this.showFeedback
        };

        var login: IMenuItem = {
            buttonMlt: 'menu_login',
            icon: 'fa-sign-in',
            visible: userNotAuthenticated,
            click: goTo('#login'),
            hash: '#login'
        };

        var logout: IMenuItem = {
            buttonMlt: 'menu_logout',
            icon: 'fa-sign-out',
            visible: userAuthenticated,
            click: services.currentAccount.logout
        };

        var items = [home, myPosts, game, settings, feedback, login, logout];
        this.menuItems(items);

        this.selectedMenuItem(home);
        this.bindToNavigation();
    }

    private setupRouting(){
        var routes = services.nav.getRoutingConfig();
        router.map(routes);
        router.buildNavigationModel();
        var homeRoute = routes[0];
        router.mapUnknownRoutes(homeRoute);
        router.updateDocumentTitle = this.updateTitle;
        return router.activate();
    }

    private updateTitle = (instance, instruction) => {
        // Do nothing
    };

    private bindToNavigation(){
        router.on("router:route:activating", (viewModel, routeInstruction: DurandalRouteInstruction) => {
            var hash = routeInstruction.config.hash;
            var item = this.getMenuItemByHash(hash);
            if (item.hash !== this.selectedMenuItem().hash){
                this.selectedMenuItem(item);
            }
        });
    }

    private getMenuItemByHash(hash: string): IMenuItem {
        var items = this.menuItems();
        var home = items[0];
        var item = _.find(items, x => hash.indexOf(x.hash) !== -1 && x.hash !== home.hash);
        if (!item){
            item = home
        }
        return item;
    }

    private showFeedback(){
        $('#feedback').modal('show');
    }
}

interface IMenuItem {
    buttonMlt: string;
    icon: string;
    visible: boolean|KnockoutComputed<boolean>;
    click: Function;
    hash?: string;
}

export = Shell;