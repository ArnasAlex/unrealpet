/// <reference path='../../../typings/refs.d.ts' />
import ko = require('knockout');
import routes = require('../../routes');
import services = require('../../core/services/services');
import grid = require('../../core/components/adminSearchGrid/adminSearchGrid');

class Feedbacks extends grid.AdminSearchGrid {
    getUrl(){
        return routes.admin.getFeedbacks;
    }

    updateListItem(item: IFeedback){
        return new Feedback(item);
    }
}

class Feedback {
    id: string;
    name: string;
    ip: string;
    createdOn: string;
    isHappy: string;
    message: string;
    accountId: string;

    constructor(dto: IFeedback){
        this.id = dto.id;
        this.name = dto.name;
        this.ip = dto.ip;
        this.isHappy = dto.isHappy ? 'Happy' : 'Sad';
        this.message = dto.message;
        this.accountId = dto.accountId;

        var creation = dto.createdOn.replace('Z', '').split('T');
        this.createdOn = creation[0] + ' ' + creation[1];
    }
}

export = Feedbacks;