var Window = (function () {
    function Window() {
    }
    Window.baseUrl = 'http://localhost:3000';
    Window.pageLogin = Window.baseUrl + '#/login';
    Window.waitMs = 2000;
    Window.validationClass = 'has-error';
    return Window;
})();
exports.Window = Window;
var Modal = (function () {
    function Modal() {
    }
    Modal.form = '.modal-dialog';
    Modal.buttonPrimary = Modal.form + ' .btn-primary';
    return Modal;
})();
exports.Modal = Modal;
var Menu = (function () {
    function Menu() {
    }
    Menu.navBar = '.navbar';
    Menu.buttonLogin = Menu.navBar + ' a.menu-login';
    Menu.buttonGroup = Menu.navBar + ' .btn-group';
    Menu.buttonGroupButton = Menu.buttonGroup + ' button';
    Menu.buttonGroupSettings = Menu.buttonGroup + ' li a i.fa-sign-in';
    return Menu;
})();
exports.Menu = Menu;
var Login = (function () {
    function Login() {
    }
    Login.form = '.login';
    Login.buttonSignup = Login.form + ' a.button-signup';
    Login.buttonLogin = Login.form + ' button.button-login';
    Login.inputEmail = Login.form + ' #inputEmail';
    Login.inputPassword = Login.form + ' #inputPassword';
    return Login;
})();
exports.Login = Login;
var Signup = (function () {
    function Signup() {
    }
    Signup.form = '.signup';
    Signup.buttonSignup = Signup.form + ' button.button-signup';
    Signup.inputEmail = Signup.form + ' #inputEmail';
    Signup.inputPassword = Signup.form + ' #inputPassword';
    Signup.inputRepeatPassword = Signup.form + ' #repeatPassword';
    return Signup;
})();
exports.Signup = Signup;
var Home = (function () {
    function Home() {
    }
    Home.form = '.home';
    return Home;
})();
exports.Home = Home;
//# sourceMappingURL=selectors.js.map