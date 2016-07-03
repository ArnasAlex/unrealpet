define(["require", "exports"], function (require, exports) {
    var UtilService = (function () {
        function UtilService() {
        }
        UtilService.prototype.getTimeAgo = function (isoDate) {
            var date = new Date(isoDate);
            var diff = new Date().getTime() - date.getTime();
            var seconds = Math.floor(diff / 1000);
            var interval = Math.floor(seconds / 31536000);
            if (interval >= 1) {
                return this.formatTimeAgo(interval, window.mltId.date_short_year);
            }
            interval = Math.floor(seconds / 2592000);
            if (interval >= 1) {
                return this.formatTimeAgo(interval, window.mltId.date_short_month);
            }
            interval = Math.floor(seconds / 86400);
            if (interval >= 1) {
                return this.formatTimeAgo(interval, window.mltId.date_short_day);
            }
            interval = Math.floor(seconds / 3600);
            if (interval >= 1) {
                return this.formatTimeAgo(interval, window.mltId.date_short_hour);
            }
            interval = Math.floor(seconds / 60);
            if (interval >= 1) {
                return this.formatTimeAgo(interval, window.mltId.date_short_minute);
            }
            var interval = Math.floor(seconds);
            if (interval <= 0) {
                interval = 1;
            }
            return this.formatTimeAgo(interval, window.mltId.date_short_second);
        };
        UtilService.prototype.formatTimeAgo = function (interval, unit) {
            return interval + unit;
        };
        return UtilService;
    })();
    exports.UtilService = UtilService;
});
//# sourceMappingURL=utilService.js.map