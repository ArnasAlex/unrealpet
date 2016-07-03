/// <reference path="../../../typings/refs.d.ts" />
import http = require('plugins/http');
import routes = require('../../routes');
import uiService = require('./uiService');
import navService = require('./navService');
import currentAccountService = require('./currentAccountService');

export class ServerService {
    routes = routes;
    private ui: uiService.UiService;
    private nav: navService.NavService;
    private currentAccount: currentAccountService.CurrentAccountService;

    constructor(){
    }

    init(ui: uiService.UiService, nav: navService.NavService, currentAccount: currentAccountService.CurrentAccountService){
        this.ui = ui;
        this.nav = nav;
        this.currentAccount = currentAccount;
    }

    get(route: string, data: any): JQueryPromise<any> {
        var getPromise = http.get(route, data);
        getPromise.fail((response) => {
            this.handleErrors(response.status);
        });

        return getPromise;
    }

    post(route: string, data: any): JQueryPromise<any> {
        var postPromise = http.post(route, data);
        postPromise.fail((response) => {
            this.handleErrors(response.status);
        });

        return postPromise;
    }

    handleErrors(status: number){
        switch (status){
            case 401:
                this.handleUnauthenticated();
                break;

            case 403:
                this.handleUnauthorized();
                break;
        }
    }

    private handleUnauthenticated(){
        if (this.currentAccount.isAuthenticated()){
            this.currentAccount.getCurrentUser();
            return;
        }
        this.ui.showMessage({
            msg: window.mltId.error_unauthenticated_msg,
            title: window.mltId.error_unauthenticated_title,
            showSecondButton: true,
            closeCb: (result: ModalResult) => {
                if (result === ModalResult.Primary){
                    this.nav.goTo(Routes.Login);
                }
            },
            primaryBtnLbl: window.mltId.login_login
        });
    }

    private handleUnauthorized() {
        this.nav.goTo(Routes.Home);
    }
}