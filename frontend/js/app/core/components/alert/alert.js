define(["require", "exports", 'knockout', '../../services/services'], function (require, exports, ko, services) {
    var Alert = (function () {
        function Alert() {
            var _this = this;
            this.message = ko.observable('');
            this.isVisible = ko.observable(false);
            this.typeClass = ko.observable('');
            this.icon = ko.observable('');
            this.alertAdded = function (options) {
                _this.options = options;
                _this.showAlert();
            };
            this.bindToUiService();
        }
        Alert.prototype.compositionComplete = function () {
        };
        Alert.prototype.hide = function () {
            this.isVisible(false);
        };
        Alert.prototype.bindToUiService = function () {
            services.ui.registerAlertComponent(this.alertAdded);
        };
        Alert.prototype.showAlert = function () {
            this.message(this.options.msg);
            var classOfType = this.getClassByType(this.options.type);
            this.typeClass(classOfType);
            this.icon(this.options.icon);
            this.animate();
        };
        Alert.prototype.animate = function () {
            var _this = this;
            var alert = $('#alert');
            alert.css('bottom', '50%');
            this.isVisible(true);
            var delay = this.options.waitLonger ? 5000 : 1000;
            alert
                .velocity('fadeIn')
                .velocity({ bottom: '0', opacity: '0.2' }, { duration: 1500, delay: delay, complete: function () {
                    _this.isVisible(false);
                } });
        };
        Alert.prototype.getClassByType = function (type) {
            switch (type) {
                case 1:
                    return 'alert-info';
                case 2:
                    return 'alert-warning';
                case 0:
                    return 'alert-success';
                case 3:
                    return 'alert-danger';
            }
            return '';
        };
        return Alert;
    })();
    return Alert;
});
//# sourceMappingURL=alert.js.map