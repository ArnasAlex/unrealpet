import wh = require('../helpers/windowEx');
import cus = require('./currentAccountService');
import mus = require('./multilangService');
import uis = require('./uiService');
import nas = require('./navService');
import ens = require('./enumService');
import ses = require('./serverService');
import uts = require('./utilService');

class Services {
    public static currentAccount = new cus.CurrentAccountService();
    public static mlt = new mus.MultilangService();
    public static ui = new uis.UiService();
    public static nav = new nas.NavService();
    public static enum = new ens.EnumService();
    public static server = new ses.ServerService();
    public static util = new uts.UtilService();

    public static init(){
        wh.WindowHelpers.register();

        Services.enum.init((cb) => {Services.mlt.subscribeToMltRetrieve(cb);});
        Services.server.init(Services.ui, Services.nav, Services.currentAccount);
        Services.currentAccount.init(Services.mlt, Services.nav, Services.server, Services.ui);
    }
}

export = Services;