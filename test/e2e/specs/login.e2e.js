/// <reference path="../typings/refs.d.ts" />
var s = require('../helper/selectors');
var currentDate = new Date().getTime();
var email = "some" + currentDate + "email@gmail.com";
var password = 'somePassword';
module.exports = {
    before: function (browser) {
        browser
            .url(s.Window.baseUrl);
    },
    after: function (browser) {
        browser
            .end();
    },
    'Signup with email': function (browser) {
        browser
            .waitForElementVisible(s.Menu.buttonLogin, s.Window.waitMs)
            .click(s.Menu.buttonLogin)
            .waitForElementVisible(s.Login.buttonSignup, s.Window.waitMs)
            .click(s.Login.buttonSignup)
            .waitForElementVisible(s.Signup.buttonSignup, s.Window.waitMs)
            .click(s.Signup.buttonSignup)
            .assert.cssClassPresent(s.Signup.inputEmail, s.Window.validationClass)
            .setValue(s.Signup.inputEmail, email)
            .setValue(s.Signup.inputPassword, password)
            .assert.cssClassNotPresent(s.Signup.inputEmail, s.Window.validationClass)
            .setValue(s.Signup.inputRepeatPassword, password)
            .click(s.Signup.buttonSignup)
            .waitForElementVisible(s.Modal.buttonPrimary, s.Window.waitMs)
            .click(s.Modal.buttonPrimary)
            .waitForElementVisible(s.Login.form, s.Window.waitMs);
    },
    'Login with email': function (browser) {
        browser
            .waitForElementVisible(s.Menu.buttonLogin, s.Window.waitMs)
            .click(s.Menu.buttonLogin)
            .waitForElementVisible(s.Login.buttonLogin, s.Window.waitMs)
            .setValue(s.Login.inputEmail, email)
            .setValue(s.Login.inputPassword, password)
            .click(s.Login.buttonLogin)
            .waitForElementVisible(s.Home.form, s.Window.waitMs);
    }
};
//# sourceMappingURL=login.e2e.js.map