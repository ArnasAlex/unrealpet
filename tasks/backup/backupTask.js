var _ = require('lodash');
var names = require('../taskNames');
var BackupTask = (function () {
    function BackupTask(doneTask, grunt, params) {
        var _this = this;
        this.doneTask = doneTask;
        this.grunt = grunt;
        this.params = params;
        this.args = [];
        this.usageMsg = 'Try "grunt backup:{dump/restore}:{local/prod/test}[:restoreFolderDateName]';
        this.execute = function () {
            _this.grunt.util.spawn({
                cmd: 'mongo' + _this.task,
                args: _this.args,
                opts: { stdio: [process.stdin, process.stout, process.stderr]
                }
            }, function (error, result) {
                if (error) {
                    console.log(result.stderr);
                }
                console.log(result.stdout);
                _this.doneTask();
            });
        };
        if (params.length < 2) {
            console.log('Param count is less than 2. ' + this.usageMsg);
            doneTask();
            return;
        }
        this.collectInfo();
        this.execute();
    }
    BackupTask.prototype.fillConfig = function () {
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
    };
    BackupTask.prototype.collectInfo = function () {
        this.task = this.params[0];
        if (['dump', 'restore'].indexOf(this.task) === -1) {
            throw Error('Task name is wrong: ' + this.task + '. ' + this.usageMsg);
        }
        if (this.task === 'restore' && !this.params[2]) {
            throw Error('Folder name must be provided on restore: ' + this.params[2] + '. ' + this.usageMsg);
        }
        this.fillConfig();
        var envName = this.params[1];
        var env = _.find(this.environments, function (x) { return x.name === envName; });
        if (!env) {
            throw Error('Environment name is wrong: ' + envName + '. ' + this.usageMsg);
        }
        this.args.push('--db=' + env.database);
        if (this.task === 'dump') {
            var dateString = new Date().toISOString();
            var nr = dateString.indexOf('.');
            var re = new RegExp(':', 'g');
            dateString = dateString.substr(0, nr).replace(re, '-');
            this.args.push('--out=' + env.folder + '/' + dateString);
        }
        if (this.task === 'restore') {
            this.args.push('--drop');
            this.args.push(env.folder + '/' + this.params[2] + '/' + env.database);
        }
    };
    return BackupTask;
})();
module.exports = function (grunt) {
    grunt.registerTask(names.TaskNames.backup, function () {
        var done = this.async();
        var runner = new BackupTask(done, grunt, arguments);
    });
};
//# sourceMappingURL=backupTask.js.map