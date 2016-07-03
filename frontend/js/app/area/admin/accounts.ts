/// <reference path='../../../typings/refs.d.ts' />
import ko = require('knockout');
import routes = require('../../routes');
import services = require('../../core/services/services');

class Accounts {
    filter = ko.observable('');
    list = ko.observableArray<IAccount>([]);
    page = ko.observable(0);
    count = ko.observable(0);
    sort = ko.observable({createdOn: -1});

    private pageSize = 25;

    activate() {
        this.getAccounts();
    }

    bindingComplete(){
        this.bindSort();
    }

    deactivate() {
        this.unbindSort();
    }

    search = () => {
        this.page(0);
        this.getAccounts();
    };

    next = () => {
        this.page(this.page() + 1);
        this.getAccounts();
    };

    prev = () => {
        var currentPage = this.page();
        if (currentPage > 0){
            this.page(currentPage - 1);
        }

        this.getAccounts();
    };

    private getAccounts() {
        var request: IGetAccountsRequest = {
            filter: this.filter(),
            skip: this.page() * this.pageSize,
            take: this.pageSize,
            sort: this.sort()
        };
        services.server.get(routes.admin.getAccounts, request).then((response) => {
            this.getCb(response);
        });
    }

    private getCb(response: IGetAccountsResponse){
        var list = [];
        for (var i = 0; i < response.list.length; i++){
            list.push(new Account(response.list[i]));
        }
        this.list(list);

        if (this.page() === 0) {
            this.count(response.totalCount);
        }
    }

    private bindSort(){
        $('.admin-accounts table th').on('click', this.sortCliked);
    }

    private unbindSort(){
        $('.admin-accounts table th').off('click', this.sortCliked);
    }

    private sortCliked = (evt) => {
        var el = window.getTarget(evt);
        var column = el.attr('data-column');
        if (!column){ return; }

        var currentSort = this.sort();
        var newSort = null;
        if (currentSort && currentSort[column] !== undefined){
            newSort = currentSort;
            newSort[column] *= -1;
        }
        else{
            newSort = {};
            newSort[column] = 1;
        }
        this.sort(newSort);
        this.getAccounts();
    }
}

class Account {
    id: string;
    email: string;
    name: string;
    createdOn: string;
    lastActivityOn: string;
    master: string;
    type: string;

    constructor(dto: IAccount){
        this.id = dto.id;
        this.name = dto.name;
        this.email = dto.email;
        this.master = dto.master ? dto.master : '';
        this.type = this.getLoginProviderName(dto.loginProvider);

        var creation = dto.createdOn.toString().replace('Z', '').split('T');
        this.createdOn = creation[0] + ' ' + creation[1];

        if (dto.lastActivityOn){
            var activity = dto.lastActivityOn.toString().replace('Z', '').split('T');
            this.lastActivityOn = activity[0] + ' ' + activity[1];
        }
        else{
            this.lastActivityOn = null;
        }
    }

    private getLoginProviderName(provider: LoginProvider){
        switch(provider){
            case LoginProvider.Email:
                return 'Email';
            case LoginProvider.Facebook:
                return 'Facebook';
            case LoginProvider.Google:
                return 'Google';
        }
    }
}

export = Accounts;