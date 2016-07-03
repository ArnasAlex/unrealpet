export class Window {
    static baseUrl = 'http://localhost:3000';
    static pageLogin = Window.baseUrl + '#/login';
    static waitMs = 2000;
    static validationClass = 'has-error';
}

export class Modal {
    static form = '.modal-dialog';
    static buttonPrimary = Modal.form + ' .btn-primary';
}

export class Menu {
    static navBar = '.navbar';
    static buttonLogin = Menu.navBar + ' a.menu-login';
    static buttonGroup = Menu.navBar + ' .btn-group';
    static buttonGroupButton = Menu.buttonGroup + ' button';
    static buttonGroupSettings = Menu.buttonGroup + ' li a i.fa-sign-in';
}

export class Login {
    static form = '.login';
    static buttonSignup = Login.form + ' a.button-signup';
    static buttonLogin = Login.form + ' button.button-login';
    static inputEmail = Login.form + ' #inputEmail';
    static inputPassword = Login.form + ' #inputPassword';
}

export class Signup {
    static form = '.signup';
    static buttonSignup = Signup.form + ' button.button-signup';
    static inputEmail = Signup.form + ' #inputEmail';
    static inputPassword = Signup.form + ' #inputPassword';
    static inputRepeatPassword = Signup.form + ' #repeatPassword';
}

export class Home {
    static form = '.home';
}