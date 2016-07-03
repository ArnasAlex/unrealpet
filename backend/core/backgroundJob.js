var processJobOp = require('../operation/job/proccessBackgroundJobOperation');
var db = require('./database');
var BackgroundJob = (function () {
    function BackgroundJob() {
        var _this = this;
        this.loop = function () {
            new processJobOp.ProcessBackgroundJobOperation({}).execute(function (response) {
                var interval = response.hasWorked ? 0 : BackgroundJob.interval;
                setTimeout(_this.loop, interval);
            });
        };
    }
    BackgroundJob.prototype.start = function () {
        var _this = this;
        new db.Database(function () {
            _this.loop();
        });
    };
    BackgroundJob.interval = 5000;
    return BackgroundJob;
})();
exports.BackgroundJob = BackgroundJob;
//# sourceMappingURL=backgroundJob.js.map