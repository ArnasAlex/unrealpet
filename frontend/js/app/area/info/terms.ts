/// <reference path='../../../typings/refs.d.ts' />
import ko = require('knockout');
import routes = require('../../routes');
import services = require('../../core/services/services');

class Terms{
    language = ko.observable(Language.NotDefined);

    constructor() {
    }

    activate() {
        services.mlt.subscribeToMltRetrieve(() => {
           var lang = services.mlt.language;
            this.language(lang);
        });
    }
}

export = Terms;