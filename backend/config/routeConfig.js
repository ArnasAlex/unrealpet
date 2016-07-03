var logger = require('../core/logger');
var _ = require('lodash');
var url = require('url');
var acc = require('../controller/accountController');
var auc = require('../controller/authController');
var adc = require('../controller/adminController');
var gc = require('../controller/generalController');
var gac = require('../controller/gameController');
var pc = require('../controller/postController');
var atc = require('../controller/activityController');
var saveConnection = require('../operation/admin/saveConnectionOperation');
var RouteConfig = (function () {
    function RouteConfig() {
    }
    RouteConfig.initRoutes = function (app) {
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
    };
    RouteConfig.getHttpMethodName = function (method) {
        if (!this.httpMethods) {
            this.httpMethods = [];
            this.httpMethods[1] = 'get';
            this.httpMethods[2] = 'post';
        }
        return this.httpMethods[method];
    };
    RouteConfig.secureAndLog = function (req, res, next) {
        RouteConfig.securityMiddleware(req, res, next);
        RouteConfig.loggingMiddleware(req);
    };
    RouteConfig.loggingMiddleware = function (req) {
        try {
            var connection = {
                action: url.parse(req.url).pathname,
                accountId: req.user ? req.user.id : null,
                accountName: req.user ? req.user.name : null,
                ip: req.ip,
                request: RouteConfig.getRequestPayload(req)
            };
            if (connection.action.indexOf('/activity/getupdates') !== -1)
                return;
            new saveConnection.SaveConnectionOperation(connection).execute(function () { });
        }
        catch (error) {
            logger.Logger.logError('Error on logging connection: ' + error);
        }
    };
    RouteConfig.getRequestPayload = function (req) {
        var payload;
        if (req.method === 'POST') {
            payload = req.body;
        }
        else {
            payload = req.query;
        }
        return JSON.stringify(payload);
    };
    RouteConfig.securityMiddleware = function (req, res, next) {
        var urlSplit = req.url.split('/');
        var controllerName = urlSplit[1].toLowerCase();
        var actionName = urlSplit[2].toLowerCase();
        if (actionName.length >= 3 && actionName.indexOf('?') >= 0) {
            actionName = actionName.split('?')[0].toLowerCase();
        }
        var roles = _.clone(RouteConfig.routeRoleMap[controllerName][actionName]);
        RouteConfig.handleSecurity(roles, req, res, next);
    };
    RouteConfig.handleSecurity = function (roles, req, res, next) {
        if (!roles || roles.length == 0) {
            next();
            return;
        }
        var authIndex = roles.indexOf(1);
        var isActionValid = true;
        if (authIndex != -1) {
            isActionValid = RouteConfig.authenticate(req, res);
            roles.splice(authIndex, 1);
        }
        if (isActionValid && roles.length > 0) {
            isActionValid = RouteConfig.authorize(roles, req, res);
        }
        if (isActionValid) {
            next();
        }
    };
    RouteConfig.authenticate = function (req, res) {
        var isAuthenticated = req.isAuthenticated();
        if (!isAuthenticated) {
            res.status(401);
            res.send('Unauthenticated.');
        }
        return isAuthenticated;
    };
    RouteConfig.authorize = function (roles, req, res) {
        var user = req.user;
        var isAuthorized = user != null && _.intersection(user.roles, roles).length > 0;
        if (!isAuthorized) {
            res.status(403);
            res.send('Unauthorized');
        }
        return isAuthorized;
    };
    RouteConfig.registerRouteRoles = function (controllerName, actionName, roles) {
        if (!RouteConfig.routeRoleMap[controllerName]) {
            RouteConfig.routeRoleMap[controllerName] = [];
        }
        RouteConfig.routeRoleMap[controllerName][actionName] = roles;
    };
    RouteConfig.getControllers = function () {
        return [
            new acc.AccountController(),
            new auc.AuthController(),
            new gc.GeneralController(),
            new pc.PostController(),
            new adc.AdminController(),
            new atc.ActivityController(),
            new gac.GameController()
        ];
    };
    RouteConfig.routeRoleMap = [];
    return RouteConfig;
})();
exports.RouteConfig = RouteConfig;
//# sourceMappingURL=routeConfig.js.map