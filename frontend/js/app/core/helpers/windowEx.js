define(["require", "exports"], function (require, exports) {
    var WindowHelpers = (function () {
        function WindowHelpers() {
        }
        WindowHelpers.register = function () {
            WindowHelpers.registerGetTarget();
        };
        WindowHelpers.registerGetTarget = function () {
            window.getTarget = function (evt) {
                return $(evt.target || evt.srcElement);
            };
        };
        return WindowHelpers;
    })();
    exports.WindowHelpers = WindowHelpers;
});
//# sourceMappingURL=windowEx.js.map