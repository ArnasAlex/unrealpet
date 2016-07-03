/// <reference path="../typings/refs.d.ts" />
import express = require('express');
import authConfig = require('./authConfig');
import logger = require('../core/logger');
import _ = require('lodash');
import url = require('url');

import controller = require('../controller/base/controller');
import acc = require('../controller/accountController');
import auc = require('../controller/authController');
import adc = require('../controller/adminController');
import gc = require('../controller/generalController');
import gac = require('../controller/gameController');
import pc = require('../controller/postController');
import atc = require('../controller/activityController');
import saveConnection = require('../operation/admin/saveConnectionOperation');

export class RouteConfig {

    private static routeRoleMap: any[][] = [];
    private static httpMethods: Array<string>;

    public static initRoutes(app: express.Application) {
        var controllers = RouteConfig.getControllers();
        for (var i = 0; i < controllers.length; i++) {
            var controller = controllers[i];
            var config = controller.getConfig();
            var controllerName = config.name.toLowerCase();

            for (var j = 0; j < config.actions.length; j++) {
                var action = config.actions[j];
                var actionName = action.name.toLowerCase();
                var url = '/' + controllerName + '/' + actionName;
                var actionCb = action.func;
                var method = RouteConfig.getHttpMethodName(action.method);

                RouteConfig.registerRouteRoles(controllerName, actionName, action.roles);
                app[method](url, RouteConfig.secureAndLog, actionCb);
            }
        }
    }

    private static getHttpMethodName(method: HttpMethod){
        if (!this.httpMethods){
            this.httpMethods = [];
            this.httpMethods[HttpMethod.get] = 'get';
            this.httpMethods[HttpMethod.post] = 'post';
        }

        return this.httpMethods[method];
    }

    private static secureAndLog(req: express.Request, res: express.Response, next: Function){
        RouteConfig.securityMiddleware(req, res, next);
        RouteConfig.loggingMiddleware(req);
    }

    private static loggingMiddleware(req: express.Request) {
        try {
            var connection: saveConnection.ISaveConnectionRequest = {
                action: url.parse(req.url).pathname,
                accountId: req.user ? req.user.id : null,
                accountName: req.user ? req.user.name : null,
                ip: req.ip,
                request: RouteConfig.getRequestPayload(req)
            };

            if (connection.action.indexOf('/activity/getupdates') !== -1) return;

            new saveConnection.SaveConnectionOperation(connection).execute(()=>{});
        }
        catch(error){
            logger.Logger.logError('Error on logging connection: ' + error);
        }
    }

    private static getRequestPayload(req: express.Request){
        var payload;
        if (req.method === 'POST'){
            payload = req.body;
        }
        else{
            payload = req.query;
        }

        return JSON.stringify(payload);
    }

    private static securityMiddleware(req: express.Request, res: express.Response, next: Function) {
        var urlSplit = req.url.split('/');
        var controllerName = urlSplit[1].toLowerCase();

        var actionName = urlSplit[2].toLowerCase();
        if (actionName.length >= 3 && actionName.indexOf('?') >= 0) {
            actionName = actionName.split('?')[0].toLowerCase();
        }
        var roles = _.clone(RouteConfig.routeRoleMap[controllerName][actionName]);
        RouteConfig.handleSecurity(roles, req, res, next);
    }

    private static handleSecurity(roles: Array<number>, req: express.Request, res: express.Response, next: Function) {
        // Allows anonymous
        if (!roles || roles.length == 0) {
            next();
            return;
        }

        var authIndex = roles.indexOf(Role.Authenticated);
        var isActionValid = true;

        // Authenticate
        if (authIndex != -1) {
            isActionValid = RouteConfig.authenticate(req, res);

            // Remove authentication role for authorization
            roles.splice(authIndex, 1);
        }

        // Authorize
        if (isActionValid && roles.length > 0) {
            isActionValid = RouteConfig.authorize(roles, req, res);
        }

        if (isActionValid) {
            next();
        }
    }

    private static authenticate(req: express.Request, res: express.Response) {
        var isAuthenticated = req.isAuthenticated();

        if (!isAuthenticated) {
            res.status(401);
            res.send('Unauthenticated.');
        }

        return isAuthenticated;
    }

    private static authorize(roles: Array<number>, req: express.Request, res: express.Response) {
        var user = req.user;
        var isAuthorized = user != null && _.intersection(user.roles, roles).length > 0;

        // If not authorized - set forbidden status code
        if (!isAuthorized) {
            res.status(403);
            res.send('Unauthorized');
        }

        return isAuthorized;
    }

    private static registerRouteRoles(controllerName: string, actionName: string, roles: Array<number>) {
        if (!RouteConfig.routeRoleMap[controllerName]){
            RouteConfig.routeRoleMap[controllerName] = [];
        }

        RouteConfig.routeRoleMap[controllerName][actionName] = roles;
    }

    private static getControllers(): Array<controller.Controller> {
        return [
            new acc.AccountController(),
            new auc.AuthController(),
            new gc.GeneralController(),
            new pc.PostController(),
            new adc.AdminController(),
            new atc.ActivityController(),
            new gac.GameController()
        ];
    }
}