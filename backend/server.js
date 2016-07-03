/// <reference path="./typings/refs.d.ts" />
var webServer = require('./core/webServer');
var backgroundJob = require('./core/backgroundJob');
var backgroundJobOnInterval = require('./core/backgroundJobOnInterval');
var logger = require('./core/logger');
var cluster = require('cluster');
var Server = (function () {
    function Server() {
        this.defaultBackgroundJobCount = 1;
        this.runBackgroundJobOnInterval = true;
    }
    Server.prototype.start = function () {
        this.bindProcessEvents();
        if (cluster.isMaster) {
            console.log('Starting cluster');
            this.createAllWorkers();
            this.bindClusterEvents();
        }
        else {
            var parsedType = parseInt(process.env.type);
            switch (parsedType) {
                case 1:
                    this.startWebWorker();
                    break;
                case 2:
                    this.startBackgroundWorker();
                    break;
                case 3:
                    this.startBackgroundJobOnIntervalWorker();
                    break;
                default:
                    throw new Error('Starting uknown worker: ' + process.env.type);
            }
        }
    };
    Server.prototype.createAllWorkers = function () {
        var webWorkerCount = this.getWebWorkerCount();
        this.createWorkers(webWorkerCount, 1);
        var backgroundWorkerCount = process.env.BACKGROUNDJOBS || this.defaultBackgroundJobCount;
        this.createWorkers(backgroundWorkerCount, 2);
        if (this.runBackgroundJobOnInterval) {
            this.createWorkers(1, 3);
        }
    };
    Server.prototype.createWorkers = function (count, workerType) {
        if (count === 0) {
            return;
        }
        var name = this.getWorkerTypeName(workerType);
        console.log("Creating " + count + " workers of " + name + " type");
        for (var i = 0; i < count; ++i) {
            var env = { type: workerType };
            var worker = cluster.fork(env);
            worker.process.env = env;
            console.log("Worker of type " + name + " with id " + worker.process.pid + " started.");
        }
    };
    Server.prototype.getWebWorkerCount = function () {
        var count = process.env.WEBWORKERS;
        if (!count) {
            count = require('os').cpus().length;
            if (count > 2) {
                count -= this.defaultBackgroundJobCount;
            }
            if (count <= 0) {
                count = 1;
            }
        }
        return count;
    };
    Server.prototype.startWebWorker = function () {
        var web = new webServer.WebServer();
        web.start();
    };
    Server.prototype.startBackgroundWorker = function () {
        var job = new backgroundJob.BackgroundJob();
        job.start();
    };
    Server.prototype.startBackgroundJobOnIntervalWorker = function () {
        var job = new backgroundJobOnInterval.BackgroundJobOnInterval();
        job.start();
    };
    Server.prototype.bindProcessEvents = function () {
        process.on('uncaughtException', function (err) {
            var msg = 'Uncaught exception: ' + err.message + '. Stack: ' + err.stack;
            console.log(msg);
            logger.Logger.logError(msg, 3);
            process.exit(1);
        });
    };
    Server.prototype.bindClusterEvents = function () {
        cluster.on('exit', function (worker) {
            console.log('web worker %s died. restart...', worker.process.pid);
            var env = worker.process.env;
            var newWorker = cluster.fork(env);
            newWorker.process.env = env;
        });
    };
    Server.prototype.getWorkerTypeName = function (workerType) {
        switch (workerType) {
            case 2:
                return 'Background Job';
            case 1:
                return 'Web Server';
            case 3:
                return 'Background Job on Interval';
            default:
                return 'Unknown';
        }
    };
    return Server;
})();
new Server().start();
//# sourceMappingURL=server.js.map