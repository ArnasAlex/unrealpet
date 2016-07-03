var collectFilesOp = require('../operation/job/collectFilesForOptimizationOperation');
var fileCleanupOp = require('../operation/job/fileCleanupOperation');
var db = require('./database');
var BackgroundJobOnInterval = (function () {
    function BackgroundJobOnInterval() {
        var _this = this;
        this.startCollectors = function () {
            _this.loopFileOptimizationCollector();
            _this.loopFileCleanup();
        };
        this.loopFileOptimizationCollector = function () {
            new collectFilesOp.CollectFilesForOptimizationOperation({}).execute(function () {
                setTimeout(_this.loopFileOptimizationCollector, BackgroundJobOnInterval.intervals.collectOptimizationFiles);
            });
        };
        this.loopFileCleanup = function () {
            new fileCleanupOp.FileCleanupOpration({}).execute(function (res) {
                var interval = res.haveWorked
                    ? 0
                    : BackgroundJobOnInterval.intervals.fileCleanup;
                setTimeout(_this.loopFileCleanup, interval);
            });
        };
    }
    BackgroundJobOnInterval.prototype.start = function () {
        var _this = this;
        new db.Database(function () {
            _this.startCollectors();
        });
    };
    BackgroundJobOnInterval.intervals = {
        collectOptimizationFiles: 1000,
        fileCleanup: 1000 * 60 * 60
    };
    return BackgroundJobOnInterval;
})();
exports.BackgroundJobOnInterval = BackgroundJobOnInterval;
//# sourceMappingURL=backgroundJobOnInterval.js.map