/// <reference path='../../../typings/refs.d.ts' />
import ko = require('knockout');
import routes = require('../../routes');
import services = require('../../core/services/services');

class Connections {
    filter = ko.observable('');
    list = ko.observableArray<IConnection>([]);
    page = ko.observable(0);
    count = ko.observable(0);

    private pageSize = 25;

    activate() {
        this.getConnections();
    }

    search = () => {
        this.page(0);
        this.getConnections();
    };

    next = () => {
        this.page(this.page() + 1);
        this.getConnections();
    };

    prev = () => {
        var currentPage = this.page();
        if (currentPage > 0){
            this.page(currentPage - 1);
        }

        this.getConnections();
    };

    private getConnections() {
        var request: IGetConnectionsRequest = {
            filter: this.filter(),
            skip: this.page() * this.pageSize,
            take: this.pageSize
        };
        services.server.get(routes.admin.getConnections, request).then((response) => {
            this.getCb(response);
        });
    }

    private getCb(response: IGetConnectionsResponse){
        var list = [];
        for (var i = 0; i < response.list.length; i++){
            list.push(new Connection(response.list[i]));
        }
        this.list(list);

        if (this.page() === 0) {
            this.count(response.totalCount);
        }
    }
}

class Connection {
    accountName: string;
    ip: string;
    date: string;
    time: string;
    action: string;

    constructor(dto: IConnection){
        this.ip = dto.ip;
        this.action = dto.action;
        this.accountName = dto.accountName ? dto.accountName : '';
        var dateTime = dto.date.toString().replace('Z', '').split('T');
        this.date = dateTime[0];
        this.time = dateTime[1];
    }
}

export = Connections;