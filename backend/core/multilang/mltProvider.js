/// <reference path="../../typings/refs.d.ts" />
var multilangId = require('./mltId');
var mltEn = require('./mltEn');
var mltLt = require('./mltLt');
var _ = require('lodash');
var MultilangProvider = (function () {
    function MultilangProvider() {
    }
    MultilangProvider.getTranslations = function (lang) {
        if (!MultilangProvider.translations) {
            MultilangProvider.initTranslations();
        }
        return MultilangProvider.translations[lang];
    };
    MultilangProvider.getLangFromAcceptedHeaders = function (accepted) {
        if (!accepted) {
            return 0;
        }
        var supported = MultilangProvider.supported;
        var index = null;
        var language = null;
        _.each(supported, function (lang) {
            var idx = accepted.indexOf(lang.text);
            if (idx !== -1 && (index === null || index > idx)) {
                index = idx;
                language = lang;
            }
        });
        return language ? language.id : 0;
    };
    MultilangProvider.getDefaultLanguage = function () {
        return 1;
    };
    MultilangProvider.initTranslations = function () {
        MultilangProvider.translations = [];
        MultilangProvider.translations[1] = new mltEn.MltEn();
        MultilangProvider.translations[2] = new mltLt.MltLt();
    };
    MultilangProvider.multilangIds = new multilangId.MltId();
    MultilangProvider.supported = [
        {
            id: 1,
            text: 'en'
        },
        {
            id: 2,
            text: 'lt'
        }];
    return MultilangProvider;
})();
exports.MultilangProvider = MultilangProvider;
//# sourceMappingURL=mltProvider.js.map