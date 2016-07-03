/// <reference path="./../typings/refs.d.ts" />
var express = require('express');
var envCfg = require('../config/environmentConfig');
var routeCfg = require('../config/routeConfig');
var authCfg = require('../config/authConfig');
var db = require('./database');
var getFacebookPageOp = require('../operation/post/getPageForFacebookOperation');
var session = require('express-session');
var bodyParser = require("body-parser");
var MongoStore = require('connect-mongo')(session);
var compression = require('compression');
var forceDomain = require('forcedomain');
var Application = (function () {
    function Application() {
        this.sessionTimeoutMs = 3 * 24 * 60 * 60 * 1000;
        this.staticFileCacheMs = 365 * 24 * 60 * 60 * 1000;
        this.facebookMiddleware = function (req, res, next) {
            if (req.url.indexOf('ref=fb') !== -1 && req.url.indexOf('post') !== -1) {
                var request = {
                    req: req
                };
                new getFacebookPageOp.GetPageForFacebookOperation(request).execute(function (response) {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(response.content ? response.content : response.error);
                    res.end();
                });
            }
            else {
                next();
            }
        };
        this.app = express();
        this.forceWww();
        this.initStaticFiles();
        this.app.enable("trust proxy");
        this.app.set('x-powered-by', false);
        this.app.use(bodyParser.json());
        this.app.use(session({
            secret: "xxx",
            cookie: { maxAge: this.sessionTimeoutMs },
            rolling: true,
            resave: false,
            saveUninitialized: false,
            store: new MongoStore({ url: envCfg.EnvironmentConfig.getConnectionString() })
        }));
        authCfg.AuthenticationConfig.init(this.app);
        routeCfg.RouteConfig.initRoutes(this.app);
        this.initErrorHandler();
        this.initDevelopmentErrorHandler();
        this.initDatabase();
    }
    Application.prototype.forceWww = function () {
        if (envCfg.EnvironmentConfig.getEnvironment() === envCfg.Environment.Production) {
            this.app.use(forceDomain({
                hostname: 'www.unrealpet.com'
            }));
        }
    };
    Application.prototype.initDatabase = function () {
        new db.Database();
    };
    Application.prototype.initStaticFiles = function () {
        this.app.use(compression());
        var uploadPath = this.getUploadPath();
        this.app.use('/uploads', express.static(uploadPath));
        var bundle = envCfg.EnvironmentConfig.getConfig().bundle;
        var frontendPath = this.getFrontendPath(bundle);
        this.app.use(this.facebookMiddleware);
        var cacheTime = bundle ? this.staticFileCacheMs : 0;
        this.app.use(express.static(frontendPath, { maxAge: cacheTime }));
    };
    Application.prototype.initErrorHandler = function () {
        this.app.use(function (req, res, next) {
            var err = new Error('Not Found: ' + req.url);
            err.status = 404;
            next(err);
        });
    };
    Application.prototype.getUploadPath = function () {
        return envCfg.EnvironmentConfig.getConfig().uploadPath;
    };
    Application.prototype.initDevelopmentErrorHandler = function () {
        if (envCfg.EnvironmentConfig.getEnvironment() === envCfg.Environment.Local) {
            this.app.use(function (err, req, res) {
                res.status(err.status || 500);
                res.send(err.message + " " + err);
            });
        }
    };
    Application.prototype.getFrontendPath = function (bundle) {
        var folder = bundle ? 'frontend-built' : 'frontend';
        var result = __dirname + '/../../' + folder + '/';
        return result;
    };
    return Application;
})();
exports.Application = Application;
//# sourceMappingURL=application.js.map