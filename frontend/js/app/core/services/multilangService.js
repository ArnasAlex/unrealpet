define(["require", "exports", 'plugins/http', '../../routes'], function (require, exports, http, routes) {
    var MultilangService = (function () {
        function MultilangService() {
            this.language = 0 /* NotDefined */;
            this.mltSubscribers = [];
            this.savedLang = 'language';
            window.mlt = this.translate;
        }
        MultilangService.prototype.load = function (cb) {
            var _this = this;
            var preferredLang;
            if (this.isLocalStorageSupported()) {
                preferredLang = window.localStorage.getItem(this.savedLang);
            }
            var req = { preferredLanguage: preferredLang };
            http.get(routes.general.getMlt, req).then(function (response) {
                _this.loadCb(response, cb);
            });
        };
        MultilangService.prototype.translate = function (mltId) {
            return MultilangService.Mlt[mltId] || mltId;
        };
        MultilangService.prototype.subscribeToMltRetrieve = function (cb) {
            if (MultilangService.Mlt !== undefined) {
                cb();
            }
            else {
                this.mltSubscribers.push(cb);
            }
        };
        MultilangService.prototype.loadCb = function (response, cb) {
            MultilangService.Mlt = response.mlt;
            this.language = response.language;
            if (this.isLocalStorageSupported()) {
                window.localStorage.setItem(this.savedLang, this.language.toString());
            }
            window.mltId = MultilangService.Mlt;
            this.notifyMltSubscribers();
            if (cb) {
                cb();
            }
        };
        MultilangService.prototype.notifyMltSubscribers = function () {
            for (var i = 0; i < this.mltSubscribers.length; i++) {
                var cb = this.mltSubscribers[i];
                cb();
            }
            this.mltSubscribers = [];
        };
        MultilangService.prototype.isLocalStorageSupported = function () {
            try {
                return 'localStorage' in window && window['localStorage'] !== null;
            }
            catch (e) {
                return false;
            }
        };
        return MultilangService;
    })();
    exports.MultilangService = MultilangService;
});
//# sourceMappingURL=multilangService.js.map