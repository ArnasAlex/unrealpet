define(["require", "exports", 'knockout'], function (require, exports, ko) {
    var Component = (function () {
        function Component() {
        }
        Component.prototype.register = function () {
            ko.components.register(this.name, this.getConfig());
        };
        Component.prototype.getBaseTemplatePath = function () {
            return 'text!core/components/';
        };
        Component.prototype.getConfig = function () {
            var _this = this;
            return {
                viewModel: {
                    createViewModel: function (params, componentInfo) {
                        var model = _this.createViewModel();
                        model.init(params.options, componentInfo.element);
                        return model;
                    }
                },
                template: this.template
            };
        };
        return Component;
    })();
    exports.Component = Component;
});
//# sourceMappingURL=component.js.map