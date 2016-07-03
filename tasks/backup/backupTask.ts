/// <reference path='../../backend/typings/refs.d.ts' />
import fs = require('fs');
import async = require('async');
import _ = require('lodash');
import path = require('path');
import names = require('../taskNames');

class BackupTask {
    private task: string;
    private args: string[] = [];
    private usageMsg = 'Try "grunt backup:{dump/restore}:{local/prod/test}[:restoreFolderDateName]';
    private environments: IEnvConfig[];

    constructor(private doneTask: () => void, private grunt, private params) {
        if (params.length < 2){
            console.log('Param count is less than 2. ' + this.usageMsg);
            doneTask();
            return;
        }

        this.collectInfo();
        this.execute();
    }

    private fillConfig() {
        this.environments = [];
        this.environments.push({
            name: 'local',
            database: 'pet',
            folder: './dump'
        });

        this.environments.push({
            name: 'test',
            database: 'test',
            folder: '../Backup'
        });

        this.environments.push({
            name: 'prod',
            database: 'unrealpet',
            folder: '../Backup'
        });
    }

    private collectInfo(){
        this.task = this.params[0];
        if (['dump', 'restore'].indexOf(this.task) === -1){
            throw Error('Task name is wrong: ' + this.task + '. ' + this.usageMsg);
        }

        if (this.task === 'restore' && !this.params[2]){
            throw Error('Folder name must be provided on restore: ' + this.params[2] + '. ' + this.usageMsg);
        }

        this.fillConfig();
        var envName = this.params[1];
        var env: IEnvConfig = _.find(this.environments, x => x.name === envName);
        if (!env){
            throw Error('Environment name is wrong: ' + envName + '. ' + this.usageMsg);
        }

        this.args.push('--db=' + env.database);

        if (this.task === 'dump'){
            var dateString = new Date().toISOString();
            var nr = dateString.indexOf('.');
            var re = new RegExp(':', 'g');
            dateString = dateString.substr(0, nr).replace(re, '-');
            this.args.push('--out=' + env.folder + '/' + dateString);
        }

        if (this.task === 'restore'){
            this.args.push('--drop');
            this.args.push(env.folder + '/' + this.params[2] + '/' + env.database);
        }
    }

    private execute = () => {
        this.grunt.util.spawn({
                cmd: 'mongo' + this.task,
                args: this.args,
                opts:
                { stdio:
                    [process.stdin, (<any>process).stout, process.stderr]
                }
            },
            (error, result) => {
                if (error) {
                    console.log(result.stderr);
                }
                console.log(result.stdout);
                this.doneTask();
            });
    };
}

module.exports = function(grunt) {
    grunt.registerTask(names.TaskNames.backup, function() {
        var done = this.async();
        var runner = new BackupTask(done, grunt, arguments);
    });
};

interface IEnvConfig {
    name: string;
    database: string;
    folder: string;
}