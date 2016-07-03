/// <reference path="../typings/refs.d.ts" />
import authcfg = require('../config/authConfig');
import iexpress = require('express');
import controller = require('./base/controller');
import signUpOp = require('../operation/login/signUpLocalOperation');
import accountHelper = require('../operation/login/accountHelper');

export class AuthController extends controller.Controller {
    private static redirectAfterAuth = "/#";
    private static redirectAfterFailAuth = "/#login";

    public getConfig(): IControllerConfig {
        return {
            name: 'auth',
            actions: [
                {
                    name: 'signup',
                    func: this.signUp,
                    method: HttpMethod.post,
                    roles: []
                },
                {
                    name: 'login',
                    func: this.login,
                    method: HttpMethod.post,
                    roles: []
                },
                {
                    name: 'logout',
                    func: this.logout,
                    method: HttpMethod.get,
                    roles: []
                },
                {
                    name: 'google',
                    func: this.google,
                    method: HttpMethod.get,
                    roles: []
                },
                {
                    name: 'googleCallback',
                    func: this.googleCallback,
                    method: HttpMethod.get,
                    roles: []
                },
                {
                    name: 'facebook',
                    func: this.facebook,
                    method: HttpMethod.get,
                    roles: []
                },
                {
                    name: 'facebookCallback',
                    func: this.facebookCallback,
                    method: HttpMethod.get,
                    roles: []
                }
            ]
        }
    }

    private signUp = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        var payload = this.getPayload(req);
        var signData: signUpOp.ISignUpLocalRequest = {
            email: payload.email,
            password: payload.password,
            req: req
        };

        new signUpOp.SignUpLocalOperation(signData).execute((response) => {
            res.send(response);
        });
    };

    private login = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        var passport = authcfg.AuthenticationConfig.getPassport();

        var login = passport.authenticate('local-login', (error, account: any) => {
            if (error) {
                return res.send({ error: error });
            }

            req.logIn(account, (err) => {
                if (err) {
                    res.send({ error: err });
                }
                return res.send(account);
            });
        });
        login(req, res, next);
    };

    private logout = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        req.logout();
        res.send({});
    };

    private google(req: iexpress.Request, res: iexpress.Response, next: Function) {
        var passport = authcfg.AuthenticationConfig.getPassport();
        var googleAuthenticate = passport.authenticate(
            accountHelper.Helper.getProviderName(LoginProvider.Google),
            { scope: ['profile', 'email'] }
        );
        googleAuthenticate(req, res, next);
    }

    private googleCallback(req: iexpress.Request, res: iexpress.Response, next: Function) {
        var passport = authcfg.AuthenticationConfig.getPassport();
        var googleAuthenticate = passport.authenticate(
            accountHelper.Helper.getProviderName(LoginProvider.Google),
            {
                successRedirect: AuthController.redirectAfterAuth,
                failureRedirect: AuthController.redirectAfterFailAuth
            });
        googleAuthenticate(req, res, next);
    }

    private facebook(req: iexpress.Request, res: iexpress.Response, next: Function) {
        var passport = authcfg.AuthenticationConfig.getPassport();
        var facebookAuthenticate = passport.authenticate(
            accountHelper.Helper.getProviderName(LoginProvider.Facebook),
            { scope: ['email'] }
        );
        facebookAuthenticate(req, res, next);
    }

    private facebookCallback(req: iexpress.Request, res: iexpress.Response, next: Function) {
        var passport = authcfg.AuthenticationConfig.getPassport();
        var facebookAuthenticate = passport.authenticate(
            accountHelper.Helper.getProviderName(LoginProvider.Facebook),
            {
                successRedirect: AuthController.redirectAfterAuth,
                failureRedirect: AuthController.redirectAfterFailAuth
            });
        facebookAuthenticate(req, res, next);
    }
}