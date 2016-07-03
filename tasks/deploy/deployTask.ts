/// <reference path='../../backend/typings/refs.d.ts' />
import fs = require('fs');
import async = require('async');
import _ = require('lodash');
import path = require('path');
import names = require('../taskNames');
import child = require('child_process');
import helper = require('./deployHelper');
var ncp = require('ncp').ncp;

class DeployTask {
    private config: IDeployConfig;
    private version: string;
    private versionDir: string;
    private copyExclude: string[];
    private startTime: Date;
    private steps: IDeployStep[] = [];

    constructor(private doneTask: () => void, private grunt) {
        this.start();
    }

    private start(){
        this.startTime = new Date();
        console.log('Starting deployment...');
        async.waterfall([
            this.gitPull,
            this.npmInstall,
            this.copyFiles,
            this.createSymbolicLink,
            this.updateVersion,
            this.minAndBundle,
            this.stopOldVersion,
            this.startNewVersion
        ], this.done.bind(this));
    }

    private gitPull = (next) => {
        var dir = this.getConfig().gitDir;
        var options = {cwd: dir};

        this.logStep('Git', 'Git pull in directory: ' + dir);
        child.exec('git pull xxx', options, this.cmdCallback(next));
    };

    private npmInstall = (next) => {
        var dir = this.getConfig().gitDir;
        var options = {cwd: dir};

        this.logStep('Npm install', 'Running npm install in: ' + dir);
        child.exec('npm install', options, this.cmdCallback(next));
    };

    private copyFiles = (next) => {
        var source = this.getConfig().gitDir;
        var destination = this.getVersionDir();

        this.logStep('Copy files', 'Copying files from: ' + source + ' to: ' + destination);
        ncp.limit = 16; // concurrency
        var options = {
            filter: this.shouldCopyFile
        };
        ncp(source, destination, options, (err) => {
            if (err) {
                throw Error('Error on copy files: ' + err);
            }
            next();
        });
    };

    private createSymbolicLink = (next) => {
        var source = path.join(this.getConfig().gitDir, 'node_modules');
        var destination = path.join(this.getVersionDir(), 'node_modules');
        this.logStep('Create symbolic link', 'Creating symbolic link from: ' + source + ' to: ' + destination);
        fs.symlinkSync(source, destination, 'junction');
        next();
    };

    private updateVersion = (next) => {
        var versionDir = this.getVersionDir();
        var reqCfgPath = path.join(versionDir, 'frontend/js/app/requireConfig.ts');
        var indexHtmlPath = path.join(versionDir, 'frontend/index.html');

        this.logStep('Version update', 'Updating version in ' + reqCfgPath + ' and ' + indexHtmlPath);

        this.updateVersionForRequireConfig(reqCfgPath);
        this.updateVersionForIndexHtml(indexHtmlPath);

        this.compileFile(versionDir, reqCfgPath, next);
    };

    private minAndBundle = (next) => {
        var versionDir = this.getVersionDir();
        var rJsPath = path.join(versionDir, 'node_modules/requirejs/bin/');
        var bundleConfigPath = path.join(versionDir, 'build/bundleAndMinify.js');
        var options = {cwd: rJsPath};

        var command = 'node r.js -o ' + bundleConfigPath;
        this.logStep('Bundle and minify', 'Running r.js (in ' + rJsPath + '): ' + command);
        child.exec(command, options, this.cmdCallback(next));
    };

    private stopOldVersion = (next) => {
        var serviceName = this.getConfig().serviceName;
        var command = 'pm2 delete ' + serviceName;
        this.logStep('Stop server', 'Stopping server with name: ' + serviceName);
        var options = {cwd: this.getVersionDir()};
        var onErr = (err: Error) => {
            if (err.message.indexOf('Process ' + serviceName + ' not found') !== -1){
                console.log('Process was not started - nothing to stop.');
                next();
            }
            else{
                console.log('Error on stopping: ' + err);
                throw err;
            }
        };
        child.exec(command, options, this.cmdCallback(next, onErr));
    };

    private startNewVersion = (next) => {
        var serviceName = this.getConfig().serviceName;
        var command = 'pm2 start backend/server.js --name="' + serviceName + '"';
        var versionDir = this.getVersionDir();
        this.logStep('Start server', 'Starting server with name ' + serviceName + ' from ' + this.getVersionDir());
        var options = {cwd: versionDir};
        child.exec(command, options, this.cmdCallback(next));
    };

    private updateVersionForRequireConfig(reqCfgPath: string){
        var fileContent = fs.readFileSync(reqCfgPath, 'utf8');
        var version = this.getVersion();
        var search = /urlArgs: ".*"/;
        var replacement = 'urlArgs: "bust=v' + version + '"';
        fileContent = fileContent.replace(search, replacement);

        fs.writeFileSync(reqCfgPath, fileContent);
    }

    private updateVersionForIndexHtml(filePath: string){
        var fileContent = fs.readFileSync(filePath, 'utf8');
        var version = this.getVersion();
        var search = /data-main="js\/app\/requireConfig\.js.*"/;
        var replacement = 'data-main="js/app/requireConfig.js?bust=v' + version + '"';
        fileContent = fileContent.replace(search, replacement);

        fs.writeFileSync(filePath, fileContent);
    }

    private compileFile(versionDir: string, filePath: string, cb: ()=>void){
        var tsPath = path.join(versionDir, 'node_modules/grunt-ts/node_modules/typescript/bin/tsc.js');
        var options = {cwd: versionDir};
        var command = 'node ' + tsPath + ' ' + filePath + ' --sourcemap --module amd --removeComments' ;
        child.exec(command, options, this.cmdCallback(cb));
    }

    private shouldCopyFile = (fileName: string) => {
        var exclude = this.getCopyExclusion();

        return _.all(exclude, x => fileName.indexOf(x) === -1);
    };

    private cmdCallback(next, onErr?: (err: Error) => void){
        var cb = (error, stdout, stderr) => {
            console.log(stderr);
            console.log(stdout);

            if (error){
                if (onErr){
                    onErr(error);
                }
                else{
                    console.log('Error occurred: ' + error);
                    throw error;
                }
            }
            else{
                next();
            }
        };

        return cb;
    }

    private getCopyExclusion() {
        if (!this.copyExclude){
            var gitDir = this.getConfig().gitDir;
            this.copyExclude = [
                path.join(gitDir, 'node_modules'),
                path.join(gitDir, 'test'),
            ];
        }

        return this.copyExclude;
    }

    private getVersion() {
        if (!this.version){
            this.version = helper.DeployHelper.getPackageJson().version + '.' + new Date().getTime();
        }

        return this.version;
    }

    private getVersionDir() {
        if (!this.versionDir){
            this.versionDir = path.join(this.getConfig().versionsDir, this.getVersion());
        }

        return this.versionDir;
    }

    private getConfig = (): IDeployConfig => {
        if (!this.config){
            this.config = helper.DeployHelper.getConfig();
        }

        return this.config;
    };

    private logStep = (name: string, message: string) => {
        this.steps.push({
            start: new Date(),
            name: name
        });
        var nr = this.steps.length;
        console.log('[['+ nr + ']] ' + message);
    };

    private getSeconds(startDate: Date, endDate: Date){
        return ((endDate.getTime() - startDate.getTime()) / 1000).toFixed(1);
    }

    private done(){
        var endTime = new Date();
        var deployTime = this.getSeconds(this.startTime, endTime);
        console.log('Finished deployment in ' + deployTime + 'sec.');
        console.log('Steps time table:');
        for (var i = 0; i < this.steps.length; i++){
            var seconds = i+1 < this.steps.length
                ? this.getSeconds(this.steps[i].start, this.steps[i+1].start)
                : this.getSeconds(this.steps[i].start, endTime);
            var nr = i+1;
            console.log(nr + '. ' + this.steps[i].name + ' - ' + seconds + 'sec');
        }
        this.doneTask();
    }
}

interface IDeployStep {
    start: Date;
    name: string;
}

module.exports = function(grunt) {
    grunt.registerTask(names.TaskNames.deploy, function() {
        var done = this.async();
        var runner = new DeployTask(done, grunt);
    });
};
