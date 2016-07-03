/// <reference path='../../../typings/refs.d.ts' />
import ko = require('knockout');
import routes = require('../../routes');
import services = require('../../core/services/services');

class Admin {
    activeTab = ko.observable<Tab>(null);
    tabs: Tab[];

    activate() {
        this.createTabs();
        this.changeTab(this.tabs[2]);
    }

    private createTabs(){
        this.tabs = [
            {
                name: 'Errors',
                id: ActiveTab.Errors,
                moduleId: 'area/admin/errors'
            },
            {
                name: 'Connections',
                id: ActiveTab.Connections,
                moduleId: 'area/admin/connections'
            },
            {
                name: 'Accounts',
                id: ActiveTab.Accounts,
                moduleId: 'area/admin/accounts'
            },
            {
                name: 'Cover',
                id: ActiveTab.Cover,
                moduleId: 'area/admin/cover'
            },
            {
                name: 'Feedbacks',
                id: ActiveTab.Feedbacks,
                moduleId: 'area/admin/feedbacks'
            }
        ]
    }

    changeTab = (tab: Tab) => {
        this.activeTab(tab);
    }
}

class Tab {
    name: string;
    id: ActiveTab;
    moduleId: string;
}

declare const enum ActiveTab {
    Errors = 1,
    Connections = 2,
    Accounts = 3,
    Cover = 4,
    Feedbacks = 5
}

export = Admin;