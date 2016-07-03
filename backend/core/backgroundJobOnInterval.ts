/// <reference path="./../typings/refs.d.ts" />
import async = require('async');
import collectFilesOp = require('../operation/job/collectFilesForOptimizationOperation');
import fileCleanupOp = require('../operation/job/fileCleanupOperation');
import db = require('./database');

export class BackgroundJobOnInterval {
    static intervals: IJobIntervals = {
        collectOptimizationFiles: 1000, // 1s
        fileCleanup: 1000 * 60 * 60     // 1h
    };

    start(){
        new db.Database(() => {
            this.startCollectors();
        });
    }

    private startCollectors = () => {
        this.loopFileOptimizationCollector();
        this.loopFileCleanup();
    };

    private loopFileOptimizationCollector = () => {
        new collectFilesOp.CollectFilesForOptimizationOperation({}).execute(()=>{
            setTimeout(this.loopFileOptimizationCollector, BackgroundJobOnInterval.intervals.collectOptimizationFiles);
        });
    };

    private loopFileCleanup = () => {
        new fileCleanupOp.FileCleanupOpration({}).execute((res: fileCleanupOp.IFileCleanupResponse)=>{
            var interval = res.haveWorked
                ? 0
                : BackgroundJobOnInterval.intervals.fileCleanup;
            setTimeout(this.loopFileCleanup, interval);
        });
    };
}

interface IJobIntervals {
    collectOptimizationFiles: number;
    fileCleanup: number;
}