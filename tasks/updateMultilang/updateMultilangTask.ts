/// <reference path='../../backend/typings/refs.d.ts' />
import fs = require('fs');
import async = require('async');
import _ = require('lodash');
import path = require('path');
import names = require('../taskNames');

class UpdateMultilangTask {
    private mltInterfacePath = './interface/mlt.d.ts';
    private mltIdsPath = './backend/core/multilang/mltId.ts';
    private mltTranslationPaths = ['./backend/core/multilang/mltEn.ts','./backend/core/multilang/mltLt.ts'];

    constructor(private doneTask: () => void) {
        this.start();
    }

    private start(){
        console.log('Updating multilanguage...');
        async.waterfall([
            this.getMltIds.bind(this),
            this.updateMltIds.bind(this),
            this.updateTranslations.bind(this)
        ], this.done.bind(this));
    }

    private updateTranslations(mltIds, next){
        async.all(this.mltTranslationPaths, (path) => {
                this.updateTranslation(path, mltIds);
            },
            () => {
                next(null, mltIds);
            });
    }

    private updateTranslation(translationPath: string, mltIds){
        var allLines = fs.readFileSync(translationPath).toString().split('\n');
        var fileName = path.basename(translationPath);

        console.log('\nUpdating translations for [' + fileName + ']');

        var file = this.getUpdatedFile(allLines, mltIds, true);
        fs.writeFileSync(translationPath, file);
    }

    private getUpdatedFile(allLines: string[], mltIds: string[], countUntranslated = false){
        var untranslatedMlts = [];
        var mltLines = allLines.slice(2, allLines.length - 1);
        mltLines.sort();

        for (var i = 0; i < mltIds.length; i++){
            var mltId = mltIds[i];
            var mltLine = mltLines.length - 1 >= i ? mltLines[i] : '';
            if (mltLine.indexOf(' ' + mltId + ' =') === -1){
                var line = this.createMltIdLine(mltId);
                mltLines.splice(i, 0, line);

                if (countUntranslated){
                    untranslatedMlts.push(mltId);
                }
            }

            if (countUntranslated && mltLine.indexOf('\'' + mltId + '\'') !== -1){
                untranslatedMlts.push(mltId);
            }
        }

        if (countUntranslated){
            if (untranslatedMlts.length > 0){
                console.log('Found ' + untranslatedMlts.length + ' untranslated strings: ' + untranslatedMlts.join(', '));
            }
            else{
                console.log('All translations up to date');
            }
        }

        var file = []
            .concat(allLines.slice(0, 2))
            .concat(mltLines)
            .concat(allLines[allLines.length - 1])
            .join('\n');

        return file;
    }

    private updateMltIds(mltIds, next){
        var allLines = fs.readFileSync(this.mltIdsPath).toString().split('\n');
        var file = this.getUpdatedFile(allLines, mltIds);
        fs.writeFileSync(this.mltIdsPath, file);

        next(null, mltIds);
    }

    private createMltIdLine(mltId: string){
        var line = '    ' + mltId + ' = \'' + mltId + '\';';
        return line;
    }

    private getMltIds(next) {
        var mltLines = this.getMltIdLines();
        var mltIds = [];
        for (var i = 0; i < mltLines.length; i++){
            var line = mltLines[i];
            var colNr = line.indexOf(':');
            var mltId = line.substr(0, colNr).trim();
            mltIds.push(mltId);
        }

        console.log('Found ' + mltIds.length + ' mlts');

        next(null, mltIds);
    }

    private getMltIdLines(){
        var allLines = fs.readFileSync(this.mltInterfacePath).toString().split("\n");
        var mltLines = allLines.slice(1, allLines.length - 1);
        mltLines.sort();

        var sortedLines = [].concat(allLines[0]).concat(mltLines).concat(allLines[allLines.length - 1]);
        var file = sortedLines.join("\n");
        fs.writeFileSync(this.mltInterfacePath, file);

        return mltLines;
    }

    private done(){
        console.log('Finished updating multilanguage.');
        this.doneTask();
    }
}

var module;
module.exports = function(grunt) {
    grunt.registerTask(names.TaskNames.updateMlt, function() {
        var done = this.async();
        var runner = new UpdateMultilangTask(done);
    });
}
