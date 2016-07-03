define(["require", "exports", 'knockout', '../../core/services/services'], function (require, exports, ko, services) {
    var Terms = (function () {
        function Terms() {
            this.language = ko.observable(0);
        }
        Terms.prototype.activate = function () {
            var _this = this;
            services.mlt.subscribeToMltRetrieve(function () {
                var lang = services.mlt.language;
                _this.language(lang);
            });
        };
        return Terms;
    })();
    return Terms;
});
//# sourceMappingURL=terms.js.map