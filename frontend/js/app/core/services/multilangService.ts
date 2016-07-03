/// <reference path="../../../typings/refs.d.ts" />
import http = require('plugins/http');
import router = require('plugins/router');
import routes = require('../../routes');
import ko = require('knockout');

export class MultilangService {
    static Mlt: IMlt;
    language = Language.NotDefined;

    private mltSubscribers = [];
    private savedLang = 'language';

    constructor(){
        window.mlt = this.translate;
    }

    load(cb?: () => void){
        var preferredLang;
        if (this.isLocalStorageSupported()){
            preferredLang = window.localStorage.getItem(this.savedLang);
        }

        var req: IGetMltRequest = {preferredLanguage: preferredLang};
        http.get(routes.general.getMlt, req).then((response) => {
            this.loadCb(response, cb);
        });
    }

    translate(mltId: string) {
        return MultilangService.Mlt[mltId] || mltId;
    }

    subscribeToMltRetrieve(cb){
        if (MultilangService.Mlt !== undefined){
            cb();
        }
        else{
            this.mltSubscribers.push(cb);
        }
    }

    private loadCb(response: IGetMltResponse, cb?: () => void) {
        MultilangService.Mlt = response.mlt;
        this.language = response.language;
        if (this.isLocalStorageSupported()){
            window.localStorage.setItem(this.savedLang, this.language.toString());
        }
        window.mltId = MultilangService.Mlt;

        this.notifyMltSubscribers();

        if (cb){
            cb();
        }
    }

    private notifyMltSubscribers(){
        for (var i = 0; i < this.mltSubscribers.length; i++){
            var cb = this.mltSubscribers[i];
            cb();
        }

        this.mltSubscribers = [];
    }


    private isLocalStorageSupported(){
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch(e){
            return false;
        }
    }
}