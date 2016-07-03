/// <reference path="./../typings/refs.d.ts" />
import express = require('express');

import envCfg = require('../config/environmentConfig');
import routeCfg = require('../config/routeConfig');
import authCfg = require('../config/authConfig');
import db = require('./database');
import getFacebookPageOp = require('../operation/post/getPageForFacebookOperation');

var session = require('express-session');
var bodyParser = require("body-parser");
var MongoStore = require('connect-mongo')(session);
var compression = require('compression');
var forceDomain = require('forcedomain');

export class Application {
    app: express.Express;

    private sessionTimeoutMs = 3 * 24 * 60 * 60 * 1000; // 3 days
    private staticFileCacheMs = 365 * 24 * 60 * 60 * 1000; // year

    constructor(){
        this.app = express();
        this.forceWww();

        this.initStaticFiles();

        this.app.enable("trust proxy"); // required to get client ip
        this.app.set('x-powered-by', false);
        this.app.use(bodyParser.json()); // get information from html forms
        this.app.use(session({
            secret: "xxx",
            cookie: {maxAge: this.sessionTimeoutMs},
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

    private forceWww(){
        if (envCfg.EnvironmentConfig.getEnvironment() === envCfg.Environment.Production){
            this.app.use(forceDomain({
                hostname: 'www.unrealpet.com'
            }));
        }
    }

    private initDatabase(){
        new db.Database();
    }

    private initStaticFiles(){
        this.app.use(compression());

        var uploadPath = this.getUploadPath();
        this.app.use('/uploads', express.static(uploadPath));

        var bundle = envCfg.EnvironmentConfig.getConfig().bundle;
        var frontendPath = this.getFrontendPath(bundle);
        this.app.use(this.facebookMiddleware);
        var cacheTime = bundle ? this.staticFileCacheMs : 0;
        this.app.use(express.static(frontendPath, {maxAge: cacheTime }));
    }

    private facebookMiddleware = (req: express.Request, res: express.Response, next) => {
        if (req.url.indexOf('ref=fb') !== -1 && req.url.indexOf('post') !== -1){
            var request: getFacebookPageOp.IGetPageForFacebookRequest = {
                req: req
            };
            new getFacebookPageOp.GetPageForFacebookOperation(request).execute((response: getFacebookPageOp.IGetPageForFacebookResponse) => {
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(response.content ? response.content : response.error);
                res.end();
            });
        }
        else{
            next();
        }
    };

    private initErrorHandler(){
        this.app.use((req, res, next) => {
            var err: any = new Error('Not Found: ' + req.url);
            err.status = 404;
            next(err);
        });
    }

    private getUploadPath(){
        return envCfg.EnvironmentConfig.getConfig().uploadPath;
    }

    private initDevelopmentErrorHandler(){
        if (envCfg.EnvironmentConfig.getEnvironment() === envCfg.Environment.Local) {
            this.app.use((err, req: express.Request, res: express.Response) => {
                res.status(err.status || 500);
                res.send(err.message + " " + err);
            });
        }
    }

    private getFrontendPath(bundle: boolean){
        var folder = bundle ? 'frontend-built' : 'frontend';
        var result = __dirname + '/../../' + folder + '/';

        return result;
    }
}
