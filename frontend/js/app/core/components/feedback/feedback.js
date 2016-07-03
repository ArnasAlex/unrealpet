define(["require", "exports", 'knockout', '../../services/services', '../../../routes'], function (require, exports, ko, services, routes) {
    var Feedback = (function () {
        function Feedback() {
            var _this = this;
            this.modalSelector = '#feedback';
            this.message = ko.observable('');
            this.isHappy = ko.observable(true);
            this.save = function () {
                if (!_this.message()) {
                    return;
                }
                var req = {
                    message: _this.message(),
                    isHappy: _this.isHappy()
                };
                services.server.post(routes.general.saveFeedback, req).then(function () {
                    services.ui.showAlert({
                        msg: window.mltId.alert_save_success,
                        type: 0,
                        icon: 'fa-check'
                    });
                });
            };
            this.happy = function () {
                _this.isHappy(true);
            };
            this.sad = function () {
                _this.isHappy(false);
            };
            this.clear = function () {
                _this.message('');
                _this.isHappy(true);
            };
        }
        Feedback.prototype.compositionComplete = function () {
            this.bindEvents();
        };
        Feedback.prototype.bindEvents = function () {
            var _this = this;
            $(this.modalSelector).on('show.bs.modal', function (e) { _this.clear(); });
        };
        return Feedback;
    })();
    return Feedback;
});
//# sourceMappingURL=feedback.js.map