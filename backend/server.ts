/// <reference path="./typings/refs.d.ts" />
import webServer = require('./core/webServer');
import backgroundJob = require('./core/backgroundJob');
import backgroundJobOnInterval = require('./core/backgroundJobOnInterval');
import logger = require('./core/logger');
import cluster = require('cluster');

//process.env.WEBWORKERS = 1;
//process.env.BACKGROUNDJOBS = 1;

class Server {
    private defaultBackgroundJobCount = 1;
    private runBackgroundJobOnInterval = true;

    start(){
        this.bindProcessEvents();
        if (cluster.isMaster) {
            console.log('Starting cluster');
            this.createAllWorkers();
            this.bindClusterEvents();
        } else {
            var parsedType = parseInt(process.env.type);    // Node treats passed number as string to env variable
            switch (parsedType){
                case WorkerType.WebServer:
                    this.startWebWorker();
                    break;
                case WorkerType.BackgroundJob:
                    this.startBackgroundWorker();
                    break;
                case WorkerType.BackgroundJobInterval:
                    this.startBackgroundJobOnIntervalWorker();
                    break;
                default:
                    throw new Error('Starting uknown worker: ' + process.env.type);
            }
        }
    }

    private createAllWorkers(){
        var webWorkerCount = this.getWebWorkerCount();
        this.createWorkers(webWorkerCount, WorkerType.WebServer);

        var backgroundWorkerCount = process.env.BACKGROUNDJOBS || this.defaultBackgroundJobCount;
        this.createWorkers(backgroundWorkerCount, WorkerType.BackgroundJob);

        if (this.runBackgroundJobOnInterval) {
            // Must be only one job on interval since concurrency is not managed
            this.createWorkers(1, WorkerType.BackgroundJobInterval);
        }
    }

    private createWorkers(count: number, workerType: WorkerType){
        if (count === 0){
            return;
        }
        var name = this.getWorkerTypeName(workerType);
        console.log(`Creating ${count} workers of ${name} type`);
        for (var i = 0; i < count; ++i) {
            var env = {type: workerType};
            var worker = cluster.fork(env);
            (<any>worker.process).env = env;     // saving env copy for cluster, since env not accessible from cluster
            console.log(`Worker of type ${name} with id ${worker.process.pid} started.`);
        }
    }

    private getWebWorkerCount() {
        var count = process.env.WEBWORKERS;
        if (!count){
            count = require('os').cpus().length;
            if (count > 2){
                count -= this.defaultBackgroundJobCount;
            }

            if (count <= 0){
                count = 1;
            }
        }

        return count;
    }

    private startWebWorker(){
        var web = new webServer.WebServer();
        web.start();
    }

    private startBackgroundWorker() {
        var job = new backgroundJob.BackgroundJob();
        job.start();
    }

    private startBackgroundJobOnIntervalWorker(){
        var job = new backgroundJobOnInterval.BackgroundJobOnInterval();
        job.start();
    }

    private bindProcessEvents(){
        process.on('uncaughtException', function (err) {
            var msg = 'Uncaught exception: ' + err.message + '. Stack: ' + err.stack;
            console.log(msg);
            logger.Logger.logError(msg, ErrorType.Critical);
            process.exit(1)
        });
    }

    private bindClusterEvents(){
        cluster.on('exit', (worker) => {
            console.log('web worker %s died. restart...', worker.process.pid);
            var env = worker.process.env;
            var newWorker = cluster.fork(env);
            (<any>newWorker.process).env = env;  // saving info for cluster
        });
    }

    private getWorkerTypeName(workerType: WorkerType){
        switch (workerType){
            case WorkerType.BackgroundJob:
                return 'Background Job';
            case WorkerType.WebServer:
                return 'Web Server';
            case WorkerType.BackgroundJobInterval:
                return 'Background Job on Interval';
            default:
                return 'Unknown';
        }
    }
}

new Server().start();

