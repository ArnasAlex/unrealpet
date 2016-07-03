define(["require", "exports", '../helpers/windowEx', './currentAccountService', './multilangService', './uiService', './navService', './enumService', './serverService', './utilService'], function (require, exports, wh, cus, mus, uis, nas, ens, ses, uts) {
    var Services = (function () {
        function Services() {
        }
        Services.init = function () {
            wh.WindowHelpers.register();
            Services.enum.init(function (cb) {
                Services.mlt.subscribeToMltRetrieve(cb);
            });
            Services.server.init(Services.ui, Services.nav, Services.currentAccount);
            Services.currentAccount.init(Services.mlt, Services.nav, Services.server, Services.ui);
        };
        Services.currentAccount = new cus.CurrentAccountService();
        Services.mlt = new mus.MultilangService();
        Services.ui = new uis.UiService();
        Services.nav = new nas.NavService();
        Services.enum = new ens.EnumService();
        Services.server = new ses.ServerService();
        Services.util = new uts.UtilService();
        return Services;
    })();
    return Services;
});
//# sourceMappingURL=services.js.map