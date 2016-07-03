/// <reference path='../../../typings/refs.d.ts' />
import ko = require('knockout');
import services = require('../../core/services/services');
import router = require('plugins/router');
import routes = require('../../routes');
import _ = require('lodash');

class Home {
    gridOptions: Components.IPostSearchGridOptions;
    topSection = ko.observable(TopSection.Login);
    animationId: number;
    voteGameOptions: Components.IVoteGameOptions;

    constructor() {
    }

    activate() {
        this.init();
    }

    bindingComplete(){
        this.startTopSectionAnimation();
    }

    deactivate(){
        this.gridOptions.component.destroy();
        this.stopTopSectionAnimation();
    }

    private init(){
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
    }

    private setTopSectionByUser = (user: ICurrentUser) => {
        if (!user || !user.isAuthenticated){
            this.topSection(TopSection.Login);
            return;
        }

        if (user.postCount == 0){
            this.topSection(TopSection.AddPost);
            return;
        }

        if (user.name && user.name.toLowerCase().indexOf('unrealpet') !== -1){
            this.topSection(TopSection.ChangeName);
            return;
        }

        this.topSection(TopSection.AddPost);
    };

    private startTopSectionAnimation = () => {
        this.animationId = setTimeout(() => {
            var firstButton = $('.home .top-section > div:not([style*="display: none"]) .btn:first');
            if (firstButton.queue().length === 0){
                var animations = ['callout.pulse', 'callout.swing', 'callout.bounce'];
                var rand = Math.floor(Math.random() * 3);
                firstButton.velocity(animations[rand]);
            }

            this.startTopSectionAnimation();
        }, 3000);
    };

    private stopTopSectionAnimation = () => {
        clearTimeout(this.animationId);
    };
}

export = Home;

declare const enum TopSection {
    Login = 1,
    AddPost = 2,
    ChangeName = 3
}