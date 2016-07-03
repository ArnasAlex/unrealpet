/// <reference path="../../typings/refs.d.ts" />
import multilangId = require('./mltId');
import mltEn = require('./mltEn');
import mltLt = require('./mltLt');
import _ = require('lodash');

export class MultilangProvider {
    public static multilangIds: IMlt = new multilangId.MltId();
    private static translations: Array<IMlt>;
    private static supported: ILanguage[] = [
        {
            id: Language.English,
            text: 'en'
        },
        {
            id: Language.Lithuanian,
            text: 'lt'
        }];

    public static getTranslations(lang: Language){
        if (!MultilangProvider.translations){
            MultilangProvider.initTranslations();
        }
        return MultilangProvider.translations[lang];
    }

    public static getLangFromAcceptedHeaders(accepted: string): Language{
        if (!accepted){
            return Language.NotDefined;
        }

        var supported = MultilangProvider.supported;

        var index = null;
        var language: ILanguage = null;

        _.each(supported, lang => {
            var idx = accepted.indexOf(lang.text);
            if (idx !== -1 && (index === null || index > idx)){
                index = idx;
                language = lang;
            }
        });

        return language ? language.id : Language.NotDefined;
    }

    public static getDefaultLanguage(){
        return Language.English;
    }

    private static initTranslations(){
        MultilangProvider.translations = [];
        MultilangProvider.translations[Language.English] = new mltEn.MltEn();
        MultilangProvider.translations[Language.Lithuanian] = new mltLt.MltLt();
    }
}

interface ILanguage {
    id: Language;
    text: string;
}