/// <reference path='../../../typings/refs.d.ts' />
import ko = require('knockout');
import routes = require('../../routes');
import services = require('../../core/services/services');
import picUpload = require('./accountPictureUpload');

class Account {
    activeTab: KnockoutObservable<IAccountTab> = ko.observable(null);
    tabs: IAccountTab[] = [];

    constructor() {}

    activate(){
        this.initTabs();

        this.activeTab(this.tabs[AccountTab.Pet]);
    }

    selectTab = (tab: IAccountTab) => {
        this.activeTab(tab);
    };

    private initTabs() {
        var modulePath = 'area/account/';
        this.tabs.push({
            id: AccountTab.Pet,
            viewName: modulePath + 'accountPet',
            title: window.mltId.account_my_pet
        });

        this.tabs.push({
            id: AccountTab.Settings,
            viewName: modulePath + 'accountSettings',
            title: window.mltId.account_settings
        });
    }
}

const enum AccountTab {
    Pet = 0,
    Master = 1,
    Settings = 2
}

interface IAccountTab {
    id: AccountTab;
    viewName: string;
    title: string;
}

export = Account;