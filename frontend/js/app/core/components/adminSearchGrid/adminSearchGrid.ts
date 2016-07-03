/// <reference path='../../../../typings/refs.d.ts' />
import ko = require('knockout');
import routes = require('../../../routes');
import services = require('../../../core/services/services');

export class AdminSearchGrid {
    filter = ko.observable('');
    list = ko.observableArray([]);
    page = ko.observable(0);
    count = ko.observable(0);
    sort = ko.observable();

    private pageSize = 25;

    activate() {
        this.get();
    }

    bindingComplete(){
        this.bindSort();
    }

    deactivate() {
        this.unbindSort();
    }

    search = () => {
        this.page(0);
        this.get();
    };

    next = () => {
        this.page(this.page() + 1);
        this.get();
    };

    prev = () => {
        var currentPage = this.page();
        if (currentPage > 0){
            this.page(currentPage - 1);
        }

        this.get();
    };

    getUrl(): string{
        throw Error('implement getUrl method');
    }

    createRequest(): ISearchRequest {
        var request: ISearchRequest = {
            filter: this.filter(),
            skip: this.page() * this.pageSize,
            take: this.pageSize,
            sort: this.sort()
        };

        return request;
    }

    updateListItem(item){
        return item;
    }

    private get() {
        var req = this.createRequest();
        services.server.get(this.getUrl(), req).then((response) => {
            this.getCb(response);
        });
    }

    private getCb(response: IGetAccountsResponse){
        var list = [];
        for (var i = 0; i < response.list.length; i++){
            var item = this.updateListItem(response.list[i]);
            list.push(item);
        }
        this.list(list);

        if (this.page() === 0) {
            this.count(response.totalCount);
        }
    }

    private bindSort(){
        $('.admin-search-grid table th').on('click', this.sortCliked);
    }

    private unbindSort(){
        $('.admin-search-grid table th').off('click', this.sortCliked);
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
        this.get();
    }
}