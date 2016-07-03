/// <reference path='../../backend/typings/refs.d.ts' />
var fs = require('fs');
var async = require('async');
var path = require('path');
var names = require('../taskNames');
var UpdateMultilangTask = (function () {
    function UpdateMultilangTask(doneTask) {
        this.doneTask = doneTask;
        this.mltInterfacePath = './interface/mlt.d.ts';
        this.mltIdsPath = './backend/core/multilang/mltId.ts';
        this.mltTranslationPaths = ['./backend/core/multilang/mltEn.ts', './backend/core/multilang/mltLt.ts'];
        this.start();
    }
    UpdateMultilangTask.prototype.start = function () {
        console.log('Updating multilanguage...');
        async.waterfall([
            this.getMltIds.bind(this),
            this.updateMltIds.bind(this),
            this.updateTranslations.bind(this)
        ], this.done.bind(this));
    };
    UpdateMultilangTask.prototype.updateTranslations = function (mltIds, next) {
        var _this = this;
        async.all(this.mltTranslationPaths, function (path) {
            _this.updateTranslation(path, mltIds);
        }, function () {
            next(null, mltIds);
        });
    };
    UpdateMultilangTask.prototype.updateTranslation = function (translationPath, mltIds) {
        var allLines = fs.readFileSync(translationPath).toString().split('\n');
        var fileName = path.basename(translationPath);
        console.log('\nUpdating translations for [' + fileName + ']');
        var file = this.getUpdatedFile(allLines, mltIds, true);
        fs.writeFileSync(translationPath, file);
    };
    UpdateMultilangTask.prototype.getUpdatedFile = function (allLines, mltIds, countUntranslated) {
        if (countUntranslated === void 0) { countUntranslated = false; }
        var untranslatedMlts = [];
        var mltLines = allLines.slice(2, allLines.length - 1);
        mltLines.sort();
        for (var i = 0; i < mltIds.length; i++) {
            var mltId = mltIds[i];
            var mltLine = mltLines.length - 1 >= i ? mltLines[i] : '';
            if (mltLine.indexOf(' ' + mltId + ' =') === -1) {
                var line = this.createMltIdLine(mltId);
                mltLines.splice(i, 0, line);
                if (countUntranslated) {
                    untranslatedMlts.push(mltId);
                }
            }
            if (countUntranslated && mltLine.indexOf('\'' + mltId + '\'') !== -1) {
                untranslatedMlts.push(mltId);
            }
        }
        if (countUntranslated) {
            if (untranslatedMlts.length > 0) {
                console.log('Found ' + untranslatedMlts.length + ' untranslated strings: ' + untranslatedMlts.join(', '));
            }
            else {
                console.log('All translations up to date');
            }
        }
        var file = []
            .concat(allLines.slice(0, 2))
            .concat(mltLines)
            .concat(allLines[allLines.length - 1])
            .join('\n');
        return file;
    };
    UpdateMultilangTask.prototype.updateMltIds = function (mltIds, next) {
        var allLines = fs.readFileSync(this.mltIdsPath).toString().split('\n');
        var file = this.getUpdatedFile(allLines, mltIds);
        fs.writeFileSync(this.mltIdsPath, file);
        next(null, mltIds);
    };
    UpdateMultilangTask.prototype.createMltIdLine = function (mltId) {
        var line = '    ' + mltId + ' = \'' + mltId + '\';';
        return line;
    };
    UpdateMultilangTask.prototype.getMltIds = function (next) {
        var mltLines = this.getMltIdLines();
        var mltIds = [];
        for (var i = 0; i < mltLines.length; i++) {
            var line = mltLines[i];
            var colNr = line.indexOf(':');
            var mltId = line.substr(0, colNr).trim();
            mltIds.push(mltId);
        }
        console.log('Found ' + mltIds.length + ' mlts');
        next(null, mltIds);
    };
    UpdateMultilangTask.prototype.getMltIdLines = function () {
        var allLines = fs.readFileSync(this.mltInterfacePath).toString().split("\n");
        var mltLines = allLines.slice(1, allLines.length - 1);
        mltLines.sort();
        var sortedLines = [].concat(allLines[0]).concat(mltLines).concat(allLines[allLines.length - 1]);
        var file = sortedLines.join("\n");
        fs.writeFileSync(this.mltInterfacePath, file);
        return mltLines;
    };
    UpdateMultilangTask.prototype.done = function () {
        console.log('Finished updating multilanguage.');
        this.doneTask();
    };
    return UpdateMultilangTask;
})();
var module;
module.exports = function (grunt) {
    grunt.registerTask(names.TaskNames.updateMlt, function () {
        var done = this.async();
        var runner = new UpdateMultilangTask(done);
    });
};
//# sourceMappingURL=updateMultilangTask.js.map