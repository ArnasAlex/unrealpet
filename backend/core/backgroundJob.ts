/// <reference path="./../typings/refs.d.ts" />
import async = require('async');
import processJobOp = require('../operation/job/proccessBackgroundJobOperation');
import db = require('./database');

export class BackgroundJob{
    static interval = 5000;

    start(){
        new db.Database(() => {
            this.loop();
        });
    }

    private loop = () => {
        new processJobOp.ProcessBackgroundJobOperation({}).execute((response)=>{
            var interval = response.hasWorked ? 0 : BackgroundJob.interval;
            setTimeout(this.loop, interval);
        });
    };
}