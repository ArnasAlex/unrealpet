/// <reference path='./../typings/refs.d.ts' />
import express = require('express');
import pass = require('passport');
import _ = require('lodash');
import async = require('async');
var localStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

import envCfg = require('./environmentConfig');
import loginOp = require('../operation/login/loginOperation');
import getAccByProviderOp = require('../operation/login/getAccountByProviderOperation');
import signUpByProviderOp = require('../operation/login/signUpByProviderOperation');
import accountHelper = require('../operation/login/accountHelper');

export class AuthenticationConfig {

    private static pass: pass.Passport;

    public static init(app: express.Application) {
        AuthenticationConfig.pass = pass;
        app.use(pass.initialize());
        app.use(pass.session());
        AuthenticationConfig.setupSerialization();
        AuthenticationConfig.setupLocal(pass);
        AuthenticationConfig.setupGoogle(pass);
        AuthenticationConfig.setupFacebook(pass);
    }

    public static getPassport(): pass.Passport {
        return AuthenticationConfig.pass;
    }

    private static setupSerialization() {
        pass.serializeUser(AuthenticationConfig.serializeAccount);
        pass.deserializeUser(AuthenticationConfig.deserializeAccount);
    }

    private static serializeAccount(account: any, done) {
        done(null, account);
    }

    private static deserializeAccount(account: any, done) {
        done(null, account);
    }

    private static setupLocal(passport: pass.Passport) {
        passport.use('local-login', new localStrategy({
            usernameField: 'email',
            passwordField: 'password'
        }, AuthenticationConfig.localLoginCallback));
    }

    private static localLoginCallback(email, password, done) {
        new loginOp.LoginOperation({email: email, password: password}).execute((response) => {
            done(response.error, response.account);
        });
    }

    private static setupGoogle(passport: pass.Passport){
        var credentials = envCfg.EnvironmentConfig.getConfig();
        passport.use(new GoogleStrategy({
            clientID: credentials.google.clientId,
            clientSecret: credentials.google.clientSecret,
            callbackURL: '/auth/googlecallback',
            passReqToCallback: true
        }, AuthenticationConfig.googleCallback));
    }

    private static setupFacebook(passport: pass.Passport){
        var credentials = envCfg.EnvironmentConfig.getConfig();
        passport.use(new FacebookStrategy({
            clientID: credentials.facebook.clientId,
            clientSecret: credentials.facebook.clientSecret,
            callbackURL: '/auth/facebookcallback',
            profileFields: ['id', 'displayName', 'photos', 'gender', 'emails', 'name'],
            passReqToCallback: true
        }, AuthenticationConfig.facebookCallback));
    }

    private static googleCallback(req: express.Request, token : string, refreshToken, profile: accountHelper.ISignUpProviderProfile, done) {
        AuthenticationConfig.providerCallback(req, profile, LoginProvider.Google, done);
    }

    private static facebookCallback(req: express.Request, token : string, refreshToken, profile: accountHelper.ISignUpProviderProfile, done) {
        AuthenticationConfig.providerCallback(req, profile, LoginProvider.Facebook, done);
    }

    private static providerCallback(req: express.Request, profile: accountHelper.ISignUpProviderProfile, provider: LoginProvider, done){
        var getRequest: getAccByProviderOp.IGetAccountByProviderRequest = {
            id: profile.id,
            provider: provider
        };

        new getAccByProviderOp.GetAccountByProviderOperation(getRequest).execute((response: getAccByProviderOp.IGetAccountByProviderResponse) =>{
            if (response.exists){
                done(null, response.account);
            }
            else{
                var request: signUpByProviderOp.ISignUpByProviderRequest = {
                    provider: provider,
                    profile: profile,
                    req: req
                };
                new signUpByProviderOp.SignUpByProviderOperation(request).execute((res) => {
                    done(res.error, res.account);
                });
            }
        });
    }
}