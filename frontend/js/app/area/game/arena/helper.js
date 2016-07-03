define(["require", "exports"], function (require, exports) {
    /// <reference path='../../../../typings/refs.d.ts' />
    var Helper = (function () {
        function Helper() {
        }
        Helper.setBackgroundPicture = function ($el, url) {
            var val = "url(\"" + url + "\")";
            $el.css('background-image', val);
        };
        Helper.getPositionDifference = function (a, b, addition) {
            if (addition === void 0) { addition = 0; }
            var diff = a - b;
            var isLess = diff < 0;
            var prefix = isLess ? '-' : '+';
            if (isLess) {
                addition *= -1;
            }
            return prefix + '=' + (Math.abs(diff) + addition);
        };
        Helper.getScoreString = function (score) {
            if (score > 0) {
                return '+' + score;
            }
            return score.toString();
        };
        return Helper;
    })();
    return Helper;
});
//# sourceMappingURL=helper.js.map