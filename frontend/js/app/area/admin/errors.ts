/// <reference path='../../../typings/refs.d.ts' />
import ko = require('knockout');
import routes = require('../../routes');
import services = require('../../core/services/services');

class Connections {
    filter = ko.observable('');
    list = ko.observableArray<IError>([]);
    page = ko.observable(0);
    count = ko.observable(0);

    private pageSize = 25;

    activate() {
        this.getErrors();
    }

    search = () => {
        this.page(0);
        this.getErrors();
    };

    next = () => {
        this.page(this.page() + 1);
        this.getErrors();
    };

    prev = () => {
        var currentPage = this.page();
        if (currentPage > 0){
            this.page(currentPage - 1);
        }

        this.getErrors();
    };

    private getErrors() {
        var request: IGetErrorsRequest = {
            filter: this.filter(),
            skip: this.page() * this.pageSize,
            take: this.pageSize
        };
        services.server.get(routes.admin.getErrors, request).then((response) => {
            this.getCb(response);
        });
    }

    private getCb(response: IGetErrorsResponse){
        var list = [];
        for (var i = 0; i < response.list.length; i++){
            list.push(new Error(response.list[i]));
        }
        this.list(list);

        if (this.page() === 0) {
            this.count(response.totalCount);
        }
    }
}

class Error {
    id: string;
    message: string;
    date: string;
    time: string;
    type: string;

    constructor(dto: IError){
        this.id = dto.id;
        this.type = this.getErrorTypeName(dto.type);
        this.message = dto.message;
        var dateTime = dto.date.toString().replace('Z', '').split('T');
        this.date = dateTime[0];
        this.time = dateTime[1];
    }

    private getErrorTypeName(type: ErrorType){
        switch (type){
            case ErrorType.Critical:
                return 'Critical';
            case ErrorType.Normal:
                return 'Normal';
            case ErrorType.Warning:
                return 'Warning';
        }

        return 'Unknown';
    }
}

export = Connections;