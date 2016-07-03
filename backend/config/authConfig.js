var pass = require('passport');
var localStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var envCfg = require('./environmentConfig');
var loginOp = require('../operation/login/loginOperation');
var getAccByProviderOp = require('../operation/login/getAccountByProviderOperation');
var signUpByProviderOp = require('../operation/login/signUpByProviderOperation');
var AuthenticationConfig = (function () {
    function AuthenticationConfig() {
    }
    AuthenticationConfig.init = function (app) {
        AuthenticationConfig.pass = pass;
        app.use(pass.initialize());
        app.use(pass.session());
        AuthenticationConfig.setupSerialization();
        AuthenticationConfig.setupLocal(pass);
        AuthenticationConfig.setupGoogle(pass);
        AuthenticationConfig.setupFacebook(pass);
    };
    AuthenticationConfig.getPassport = function () {
        return AuthenticationConfig.pass;
    };
    AuthenticationConfig.setupSerialization = function () {
        pass.serializeUser(AuthenticationConfig.serializeAccount);
        pass.deserializeUser(AuthenticationConfig.deserializeAccount);
    };
    AuthenticationConfig.serializeAccount = function (account, done) {
        done(null, account);
    };
    AuthenticationConfig.deserializeAccount = function (account, done) {
        done(null, account);
    };
    AuthenticationConfig.setupLocal = function (passport) {
        passport.use('local-login', new localStrategy({
            usernameField: 'email',
            passwordField: 'password'
        }, AuthenticationConfig.localLoginCallback));
    };
    AuthenticationConfig.localLoginCallback = function (email, password, done) {
        new loginOp.LoginOperation({ email: email, password: password }).execute(function (response) {
            done(response.error, response.account);
        });
    };
    AuthenticationConfig.setupGoogle = function (passport) {
        var credentials = envCfg.EnvironmentConfig.getConfig();
        passport.use(new GoogleStrategy({
            clientID: credentials.google.clientId,
            clientSecret: credentials.google.clientSecret,
            callbackURL: '/auth/googlecallback',
            passReqToCallback: true
        }, AuthenticationConfig.googleCallback));
    };
    AuthenticationConfig.setupFacebook = function (passport) {
        var credentials = envCfg.EnvironmentConfig.getConfig();
        passport.use(new FacebookStrategy({
            clientID: credentials.facebook.clientId,
            clientSecret: credentials.facebook.clientSecret,
            callbackURL: '/auth/facebookcallback',
            profileFields: ['id', 'displayName', 'photos', 'gender', 'emails', 'name'],
            passReqToCallback: true
        }, AuthenticationConfig.facebookCallback));
    };
    AuthenticationConfig.googleCallback = function (req, token, refreshToken, profile, done) {
        AuthenticationConfig.providerCallback(req, profile, 1, done);
    };
    AuthenticationConfig.facebookCallback = function (req, token, refreshToken, profile, done) {
        AuthenticationConfig.providerCallback(req, profile, 2, done);
    };
    AuthenticationConfig.providerCallback = function (req, profile, provider, done) {
        var getRequest = {
            id: profile.id,
            provider: provider
        };
        new getAccByProviderOp.GetAccountByProviderOperation(getRequest).execute(function (response) {
            if (response.exists) {
                done(null, response.account);
            }
            else {
                var request = {
                    provider: provider,
                    profile: profile,
                    req: req
                };
                new signUpByProviderOp.SignUpByProviderOperation(request).execute(function (res) {
                    done(res.error, res.account);
                });
            }
        });
    };
    return AuthenticationConfig;
})();
exports.AuthenticationConfig = AuthenticationConfig;
//# sourceMappingURL=authConfig.js.map