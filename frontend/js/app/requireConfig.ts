/// <reference path="../typings/refs.d.ts" />
requirejs.config(<RequireConfig>{
    urlArgs: "bust=v1.0.5",
    paths: {
        "text": "../lib/require/text",
        "durandal": "../lib/durandal",
        "plugins": "../lib/durandal/plugins",
        "transitions": "../lib/durandal/transitions",
        "knockout": "../lib/knockout/knockout",
        "bootstrap": "../lib/bootstrap/bootstrap",
        "jquery": "../lib/jquery/jquery-1.9.1",
        "jquery.form": "../lib/jquery/jquery.form.min",
        "jquery-ui": "../lib/jquery/jquery-ui",
        "jquery.fileupload": "../lib/jquery/jquery.fileupload",
        "jquery.iframe-transport": "../lib/jquery/jquery.iframe-transport",
        "jquery.mockjax": "../lib/jquery/jquery.mockjax",
        "knockout.validation": "../lib/knockout/knockout.validation",
        "lodash": "../lib/lodash/lodash",
        "velocity": "../lib/jquery/velocity.min",
        "velocity.ui": "../lib/jquery/velocity.ui",
        "jquery.ui.touch-punch": "../lib/jquery/jquery.ui.touch-punch"
    },
    shim: {
        "bootstrap": {
            deps: ["jquery"],
            exports: "jQuery"
        },
        "knockout.validation": ["knockout"],
        "jquery.form": ["jquery"],
        "jquery.fileupload": ["jquery", "jquery-ui", "jquery.iframe-transport"],
        "jquery.jplayer": ["jquery"],
        "jquery.mockjax": ["jquery"],
        "velocity": ["jquery"],
        "velocity.ui": ["velocity"],
        "jquery-ui": ["jquery"],
        "jquery.ui.touch-punch": ["jquery-ui"]
    },
    deps: ['lodash', 'jquery.fileupload', 'knockout', 'bootstrap', 'jquery.ui.touch-punch', 'velocity.ui']
});

require(["main"], function(main) {
    new main.Main();
});