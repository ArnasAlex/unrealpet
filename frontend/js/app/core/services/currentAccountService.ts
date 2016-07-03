/// <reference path="../../../typings/refs.d.ts" />
import ko = require('knockout');
import http = require('plugins/http');
import routes = require('../../routes');
import multilanguage = require('./multilangService');
import navService = require('./navService');
import serverService = require('./serverService');
import uiService = require('./uiService');

export class CurrentAccountService {
    currentUser = ko.observable<ICurrentUser>(null);
    isAuthenticated: KnockoutComputed<boolean>;
    hasActivities = ko.observable(false);

    private mlt: multilanguage.MultilangService;
    private nav: navService.NavService;
    private server: serverService.ServerService;
    private ui: uiService.UiService;
    private updateCheckerId: number;
    private updateCheckInterval = 5000;
    private lastUpdate: IGetUpdatesResponse;
    private static frontendVersion: string;

    constructor() {
        this.isAuthenticated = ko.computed(() => {
            var user = this.currentUser();
            return user && user.isAuthenticated;
        });
    }

    init(mlt: multilanguage.MultilangService, nav: navService.NavService,
         server: serverService.ServerService, ui: uiService.UiService){
        this.mlt = mlt;
        this.nav = nav;
        this.server = server;
        this.ui = ui;
    }

    getCurrentUser(cb?: () => void) {
        http.get(routes.general.getCurrentUser, {}).then(
            (response) => {
                this.getCurrentUserCb(response);
                if (cb) {
                    cb();
                }
            });
    }

    postAdded() {
        this.currentUser().postCount++;
    }

    logout = () => {
        this.server.get(routes.auth.logout, {}).then(() => {
            this.getCurrentUser(() => {
                this.nav.goTo(Routes.Home);
            });
        });
    };

    private getCurrentUserCb(response: IGetCurrentUserResponse){
        if (!response.error) {
            var user = response.user;

            this.currentUser(user);
            this.reloadMlt(user);
            this.checkForUpdates();
        }
    }

    private reloadMlt = (user: ICurrentUser) => {
        if (user.isAuthenticated && user.language != Language.NotDefined && this.mlt.language !== user.language){
            var cb = () => {
                window.location.reload(false);
            };

            this.mlt.load(cb);
        }
    };

    private checkForUpdates = () => {
        if (!this.currentUser().isAuthenticated) {
            if (this.updateCheckerId) {
                clearTimeout(this.updateCheckerId);
            }
            return;
        }

        this.decideCheckInterval();
        this.updateCheckerId = setTimeout(() => {
            this.server.get(routes.activity.getUpdates, {}).then((response: IGetUpdatesResponse) => {
                this.lastUpdate = response;
                this.hasActivities(response.hasActivities);
                var isValid = this.validateApplicationVersion(response.version);
                if (isValid) {
                    this.checkForUpdates();
                }
            }).fail((response) =>{
                if (response.status !== 401){
                    this.checkForUpdates();
                }
            });

        }, this.updateCheckInterval);
    };

    private decideCheckInterval() {
        if (!this.lastUpdate || this.lastUpdate.hasActivities != this.hasActivities()){
            this.updateCheckInterval = 1000 * 5;
            return;
        }

        this.updateCheckInterval = 1000 * 10;
    }

    private validateApplicationVersion(backendVersion: string){
        if (!CurrentAccountService.frontendVersion){
            var fileUrl = $('script[src*="bust=v"]').first().attr('src');
            var fullVersion = fileUrl.split('bust=v')[1];
            var split = fullVersion.split('.');
            split = split.slice(0, 3);
            CurrentAccountService.frontendVersion = split.join('.');
        }

        var isSameVersions = backendVersion === CurrentAccountService.frontendVersion || backendVersion === 'develop';
        if(!isSameVersions){
            this.ui.showMessage({
                msg: window.mltId.update_version_msg,
                title: window.mltId.update_version_title,
                closeCb: (result: ModalResult) => {
                    window.location.reload();
                }
            });
            return false;
        }

        return true;
    }
}