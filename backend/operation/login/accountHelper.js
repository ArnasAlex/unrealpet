var mltProvider = require('../../core/multilang/mltProvider');
var Account = (function () {
    function Account() {
    }
    return Account;
})();
exports.Account = Account;
var Helper = (function () {
    function Helper() {
    }
    Helper.getProviderName = function (provider) {
        switch (provider) {
            case 1:
                return 'google';
            case 2:
                return 'facebook';
        }
        return 'unknown';
    };
    Helper.getLoginProvider = function (account) {
        if (account.google) {
            return 1;
        }
        if (account.facebook) {
            return 2;
        }
        return 0;
    };
    Helper.map = function (entity) {
        var account = {
            id: entity._id.toString(),
            name: entity.name,
            roles: entity.roles
        };
        return account;
    };
    Helper.setDefaultValuesForNewAccount = function (entity) {
        entity.name = Helper.defaultNamePrefix + Math.floor((Math.random() * 10000));
        entity.type = 1;
    };
    Helper.setLanguageForNewAccount = function (entity, request) {
        var lang = mltProvider.MultilangProvider.getLangFromAcceptedHeaders(request.headers['accept-language']);
        if (lang === 0) {
            lang = mltProvider.MultilangProvider.getDefaultLanguage();
        }
        if (!entity.settings) {
            entity.settings = { language: 0 };
        }
        entity.settings.language = lang;
    };
    Helper.defaultNamePrefix = 'UnrealPet';
    return Helper;
})();
exports.Helper = Helper;
//# sourceMappingURL=accountHelper.js.map