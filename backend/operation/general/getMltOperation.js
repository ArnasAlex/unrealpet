var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var mltProvider = require('../../core/multilang/mltProvider');
var accEntity = require('../../entities/accountEntity');
var GetMltOperation = (function (_super) {
    __extends(GetMltOperation, _super);
    function GetMltOperation() {
        _super.apply(this, arguments);
    }
    GetMltOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.getLanguageFromUserSettings.bind(this),
            this.determineLanguage.bind(this),
            this.getMlt.bind(this)
        ], this.respond.bind(this, cb));
    };
    GetMltOperation.prototype.getLanguageFromUserSettings = function (next) {
        var userId = this.request.user && this.request.user.id ? this.request.user.id : null;
        if (userId) {
            var query = { _id: this.getObjectId(userId) };
            this.mustFindOne(accEntity.CollectionName, query, function (err, acc) {
                var language = acc && acc.settings ? acc.settings.language : 0;
                next(err, language);
            });
        }
        else {
            next(null, 0);
        }
    };
    GetMltOperation.prototype.determineLanguage = function (userLang, next) {
        var lang = userLang;
        if (lang === 0) {
            lang = this.getPreferredLanguage();
        }
        if (lang === 0) {
            lang = this.getLanguageFromRequest();
        }
        if (lang === 0) {
            lang = mltProvider.MultilangProvider.getDefaultLanguage();
        }
        next(null, lang);
    };
    GetMltOperation.prototype.getPreferredLanguage = function () {
        var lang = this.request.query.preferredLanguage;
        var result = 0;
        if (lang !== '') {
            var parsedResult = parseInt(lang);
            if (!isNaN(parsedResult)) {
                result = parsedResult;
            }
        }
        return result;
    };
    GetMltOperation.prototype.getLanguageFromRequest = function () {
        var accepted = this.request.headers['accept-language'];
        var language = mltProvider.MultilangProvider.getLangFromAcceptedHeaders(accepted);
        return language;
    };
    GetMltOperation.prototype.getMlt = function (lang, next) {
        var translations = mltProvider.MultilangProvider.getTranslations(lang);
        next(null, translations, lang);
    };
    GetMltOperation.prototype.respond = function (cb, err, translations, language) {
        var response = {
            error: err,
            mlt: translations,
            language: language
        };
        cb(response);
    };
    return GetMltOperation;
})(operation.Operation);
exports.GetMltOperation = GetMltOperation;
//# sourceMappingURL=getMltOperation.js.map