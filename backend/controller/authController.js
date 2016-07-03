var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../typings/refs.d.ts" />
var authcfg = require('../config/authConfig');
var controller = require('./base/controller');
var signUpOp = require('../operation/login/signUpLocalOperation');
var accountHelper = require('../operation/login/accountHelper');
var AuthController = (function (_super) {
    __extends(AuthController, _super);
    function AuthController() {
        var _this = this;
        _super.apply(this, arguments);
        this.signUp = function (req, res, next) {
            var payload = _this.getPayload(req);
            var signData = {
                email: payload.email,
                password: payload.password,
                req: req
            };
            new signUpOp.SignUpLocalOperation(signData).execute(function (response) {
                res.send(response);
            });
        };
        this.login = function (req, res, next) {
            var passport = authcfg.AuthenticationConfig.getPassport();
            var login = passport.authenticate('local-login', function (error, account) {
                if (error) {
                    return res.send({ error: error });
                }
                req.logIn(account, function (err) {
                    if (err) {
                        res.send({ error: err });
                    }
                    return res.send(account);
                });
            });
            login(req, res, next);
        };
        this.logout = function (req, res, next) {
            req.logout();
            res.send({});
        };
    }
    AuthController.prototype.getConfig = function () {
        return {
            name: 'auth',
            actions: [
                {
                    name: 'signup',
                    func: this.signUp,
                    method: 2,
                    roles: []
                },
                {
                    name: 'login',
                    func: this.login,
                    method: 2,
                    roles: []
                },
                {
                    name: 'logout',
                    func: this.logout,
                    method: 1,
                    roles: []
                },
                {
                    name: 'google',
                    func: this.google,
                    method: 1,
                    roles: []
                },
                {
                    name: 'googleCallback',
                    func: this.googleCallback,
                    method: 1,
                    roles: []
                },
                {
                    name: 'facebook',
                    func: this.facebook,
                    method: 1,
                    roles: []
                },
                {
                    name: 'facebookCallback',
                    func: this.facebookCallback,
                    method: 1,
                    roles: []
                }
            ]
        };
    };
    AuthController.prototype.google = function (req, res, next) {
        var passport = authcfg.AuthenticationConfig.getPassport();
        var googleAuthenticate = passport.authenticate(accountHelper.Helper.getProviderName(1), { scope: ['profile', 'email'] });
        googleAuthenticate(req, res, next);
    };
    AuthController.prototype.googleCallback = function (req, res, next) {
        var passport = authcfg.AuthenticationConfig.getPassport();
        var googleAuthenticate = passport.authenticate(accountHelper.Helper.getProviderName(1), {
            successRedirect: AuthController.redirectAfterAuth,
            failureRedirect: AuthController.redirectAfterFailAuth
        });
        googleAuthenticate(req, res, next);
    };
    AuthController.prototype.facebook = function (req, res, next) {
        var passport = authcfg.AuthenticationConfig.getPassport();
        var facebookAuthenticate = passport.authenticate(accountHelper.Helper.getProviderName(2), { scope: ['email'] });
        facebookAuthenticate(req, res, next);
    };
    AuthController.prototype.facebookCallback = function (req, res, next) {
        var passport = authcfg.AuthenticationConfig.getPassport();
        var facebookAuthenticate = passport.authenticate(accountHelper.Helper.getProviderName(2), {
            successRedirect: AuthController.redirectAfterAuth,
            failureRedirect: AuthController.redirectAfterFailAuth
        });
        facebookAuthenticate(req, res, next);
    };
    AuthController.redirectAfterAuth = "/#";
    AuthController.redirectAfterFailAuth = "/#login";
    return AuthController;
})(controller.Controller);
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map