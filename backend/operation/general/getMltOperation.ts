/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import mltProvider = require('../../core/multilang/mltProvider');
import iexpress = require('express');
import accEntity = require('../../entities/accountEntity');

export class GetMltOperation extends operation.Operation {
    protected request: iexpress.Request;

    public execute(cb: (response: IGetMltResponse) => void) {
        this.async.waterfall([
            this.getLanguageFromUserSettings.bind(this),
            this.determineLanguage.bind(this),
            this.getMlt.bind(this)
        ],
        this.respond.bind(this, cb));
    }

    private getLanguageFromUserSettings(next) {
        var userId = this.request.user && this.request.user.id ? this.request.user.id : null;
        if (userId){
            var query = {_id: this.getObjectId(userId)};
            this.mustFindOne(accEntity.CollectionName, query, (err, acc: accEntity.AccountEntity) => {
                var language = acc && acc.settings ? acc.settings.language : Language.NotDefined;
                next(err, language);
            });
        }
        else{
            next(null, Language.NotDefined);
        }
    }

    private determineLanguage(userLang: Language, next) {
        var lang = userLang;
        if (lang === Language.NotDefined){
            lang = this.getPreferredLanguage();
        }
        if (lang === Language.NotDefined){
            lang = this.getLanguageFromRequest();
        }
        if (lang === Language.NotDefined){
            lang = mltProvider.MultilangProvider.getDefaultLanguage();
        }

        next(null, lang);
    }

    private getPreferredLanguage(){
        var lang = this.request.query.preferredLanguage;
        var result = Language.NotDefined;
        if (lang !== ''){
            var parsedResult = parseInt(lang);
            if (!isNaN(parsedResult)){
                result = parsedResult;
            }
        }

        return result;
    }

    private getLanguageFromRequest(): Language {
        var accepted = this.request.headers['accept-language'];
        var language = mltProvider.MultilangProvider.getLangFromAcceptedHeaders(accepted);
        return language;
    }

    private getMlt(lang: Language, next) {
        var translations = mltProvider.MultilangProvider.getTranslations(lang);
        next(null, translations, lang);
    }

    private respond(cb: (response: IGetMltResponse) => void, err, translations, language) {
        var response: IGetMltResponse = {
            error: err,
            mlt: translations,
            language: language
        };
        cb(response);
    }
}

