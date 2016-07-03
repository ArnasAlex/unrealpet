/// <reference path='../../backend/typings/refs.d.ts' />
var fs = require('fs');
var async = require('async');
var _ = require('lodash');
var path = require('path');
var names = require('../taskNames');
var child = require('child_process');
var helper = require('./deployHelper');
var ncp = require('ncp').ncp;
var DeployTask = (function () {
    function DeployTask(doneTask, grunt) {
        var _this = this;
        this.doneTask = doneTask;
        this.grunt = grunt;
        this.steps = [];
        this.gitPull = function (next) {
            var dir = _this.getConfig().gitDir;
            var options = { cwd: dir };
            _this.logStep('Git', 'Git pull in directory: ' + dir);
            child.exec('git pull xxx', options, _this.cmdCallback(next));
        };
        this.npmInstall = function (next) {
            var dir = _this.getConfig().gitDir;
            var options = { cwd: dir };
            _this.logStep('Npm install', 'Running npm install in: ' + dir);
            child.exec('npm install', options, _this.cmdCallback(next));
        };
        this.copyFiles = function (next) {
            var source = _this.getConfig().gitDir;
            var destination = _this.getVersionDir();
            _this.logStep('Copy files', 'Copying files from: ' + source + ' to: ' + destination);
            ncp.limit = 16;
            var options = {
                filter: _this.shouldCopyFile
            };
            ncp(source, destination, options, function (err) {
                if (err) {
                    throw Error('Error on copy files: ' + err);
                }
                next();
            });
        };
        this.createSymbolicLink = function (next) {
            var source = path.join(_this.getConfig().gitDir, 'node_modules');
            var destination = path.join(_this.getVersionDir(), 'node_modules');
            _this.logStep('Create symbolic link', 'Creating symbolic link from: ' + source + ' to: ' + destination);
            fs.symlinkSync(source, destination, 'junction');
            next();
        };
        this.updateVersion = function (next) {
            var versionDir = _this.getVersionDir();
            var reqCfgPath = path.join(versionDir, 'frontend/js/app/requireConfig.ts');
            var indexHtmlPath = path.join(versionDir, 'frontend/index.html');
            _this.logStep('Version update', 'Updating version in ' + reqCfgPath + ' and ' + indexHtmlPath);
            _this.updateVersionForRequireConfig(reqCfgPath);
            _this.updateVersionForIndexHtml(indexHtmlPath);
            _this.compileFile(versionDir, reqCfgPath, next);
        };
        this.minAndBundle = function (next) {
            var versionDir = _this.getVersionDir();
            var rJsPath = path.join(versionDir, 'node_modules/requirejs/bin/');
            var bundleConfigPath = path.join(versionDir, 'build/bundleAndMinify.js');
            var options = { cwd: rJsPath };
            var command = 'node r.js -o ' + bundleConfigPath;
            _this.logStep('Bundle and minify', 'Running r.js (in ' + rJsPath + '): ' + command);
            child.exec(command, options, _this.cmdCallback(next));
        };
        this.stopOldVersion = function (next) {
            var serviceName = _this.getConfig().serviceName;
            var command = 'pm2 delete ' + serviceName;
            _this.logStep('Stop server', 'Stopping server with name: ' + serviceName);
            var options = { cwd: _this.getVersionDir() };
            var onErr = function (err) {
                if (err.message.indexOf('Process ' + serviceName + ' not found') !== -1) {
                    console.log('Process was not started - nothing to stop.');
                    next();
                }
                else {
                    console.log('Error on stopping: ' + err);
                    throw err;
                }
            };
            child.exec(command, options, _this.cmdCallback(next, onErr));
        };
        this.startNewVersion = function (next) {
            var serviceName = _this.getConfig().serviceName;
            var command = 'pm2 start backend/server.js --name="' + serviceName + '"';
            var versionDir = _this.getVersionDir();
            _this.logStep('Start server', 'Starting server with name ' + serviceName + ' from ' + _this.getVersionDir());
            var options = { cwd: versionDir };
            child.exec(command, options, _this.cmdCallback(next));
        };
        this.shouldCopyFile = function (fileName) {
            var exclude = _this.getCopyExclusion();
            return _.all(exclude, function (x) { return fileName.indexOf(x) === -1; });
        };
        this.getConfig = function () {
            if (!_this.config) {
                _this.config = helper.DeployHelper.getConfig();
            }
            return _this.config;
        };
        this.logStep = function (name, message) {
            _this.steps.push({
                start: new Date(),
                name: name
            });
            var nr = _this.steps.length;
            console.log('[[' + nr + ']] ' + message);
        };
        this.start();
    }
    DeployTask.prototype.start = function () {
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
    };
    DeployTask.prototype.updateVersionForRequireConfig = function (reqCfgPath) {
        var fileContent = fs.readFileSync(reqCfgPath, 'utf8');
        var version = this.getVersion();
        var search = /urlArgs: ".*"/;
        var replacement = 'urlArgs: "bust=v' + version + '"';
        fileContent = fileContent.replace(search, replacement);
        fs.writeFileSync(reqCfgPath, fileContent);
    };
    DeployTask.prototype.updateVersionForIndexHtml = function (filePath) {
        var fileContent = fs.readFileSync(filePath, 'utf8');
        var version = this.getVersion();
        var search = /data-main="js\/app\/requireConfig\.js.*"/;
        var replacement = 'data-main="js/app/requireConfig.js?bust=v' + version + '"';
        fileContent = fileContent.replace(search, replacement);
        fs.writeFileSync(filePath, fileContent);
    };
    DeployTask.prototype.compileFile = function (versionDir, filePath, cb) {
        var tsPath = path.join(versionDir, 'node_modules/grunt-ts/node_modules/typescript/bin/tsc.js');
        var options = { cwd: versionDir };
        var command = 'node ' + tsPath + ' ' + filePath + ' --sourcemap --module amd --removeComments';
        child.exec(command, options, this.cmdCallback(cb));
    };
    DeployTask.prototype.cmdCallback = function (next, onErr) {
        var cb = function (error, stdout, stderr) {
            console.log(stderr);
            console.log(stdout);
            if (error) {
                if (onErr) {
                    onErr(error);
                }
                else {
                    console.log('Error occurred: ' + error);
                    throw error;
                }
            }
            else {
                next();
            }
        };
        return cb;
    };
    DeployTask.prototype.getCopyExclusion = function () {
        if (!this.copyExclude) {
            var gitDir = this.getConfig().gitDir;
            this.copyExclude = [
                path.join(gitDir, 'node_modules'),
                path.join(gitDir, 'test'),
            ];
        }
        return this.copyExclude;
    };
    DeployTask.prototype.getVersion = function () {
        if (!this.version) {
            this.version = helper.DeployHelper.getPackageJson().version + '.' + new Date().getTime();
        }
        return this.version;
    };
    DeployTask.prototype.getVersionDir = function () {
        if (!this.versionDir) {
            this.versionDir = path.join(this.getConfig().versionsDir, this.getVersion());
        }
        return this.versionDir;
    };
    DeployTask.prototype.getSeconds = function (startDate, endDate) {
        return ((endDate.getTime() - startDate.getTime()) / 1000).toFixed(1);
    };
    DeployTask.prototype.done = function () {
        var endTime = new Date();
        var deployTime = this.getSeconds(this.startTime, endTime);
        console.log('Finished deployment in ' + deployTime + 'sec.');
        console.log('Steps time table:');
        for (var i = 0; i < this.steps.length; i++) {
            var seconds = i + 1 < this.steps.length
                ? this.getSeconds(this.steps[i].start, this.steps[i + 1].start)
                : this.getSeconds(this.steps[i].start, endTime);
            var nr = i + 1;
            console.log(nr + '. ' + this.steps[i].name + ' - ' + seconds + 'sec');
        }
        this.doneTask();
    };
    return DeployTask;
})();
module.exports = function (grunt) {
    grunt.registerTask(names.TaskNames.deploy, function () {
        var done = this.async();
        var runner = new DeployTask(done, grunt);
    });
};
//# sourceMappingURL=deployTask.js.map