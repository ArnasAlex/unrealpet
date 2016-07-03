/// <reference path='../typings/refs.d.ts' />
import app = require('durandal/app');
import viewLocator = require('durandal/viewLocator');
import koEx = require('./core/knockout/KnockoutExtensions');
import system = require('durandal/system');
import shell = require('./area/shell/shell');
import services = require('./core/services/services');
shell;  // For bundling

export class Main {
    constructor() {

        app.title = 'Unreal Pet';

        app.configurePlugins({
            router: true
        });

        koEx.KnockoutExtensions.init();
        services.init();

        app.start()
            .then(() => {
                return this.getMultilang();
            })
            .then(() => {
                return this.loadUser();
            })
            .then(() => {
                viewLocator.useConvention();
                app.setRoot('area/shell/shell');
        });

        var enableDebug = window.location.hostname == 'localhost';
        system.debug(enableDebug);
    }

    private getMultilang(){
        var def = $.Deferred();
        services.mlt.load(def.resolve);
        return def.promise();
    }

    private loadUser(){
        var def = $.Deferred();
        services.currentAccount.getCurrentUser(def.resolve);
        return def.promise();
    }
}