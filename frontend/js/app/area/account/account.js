define(["require", "exports", 'knockout'], function (require, exports, ko) {
    var Account = (function () {
        function Account() {
            var _this = this;
            this.activeTab = ko.observable(null);
            this.tabs = [];
            this.selectTab = function (tab) {
                _this.activeTab(tab);
            };
        }
        Account.prototype.activate = function () {
            this.initTabs();
            this.activeTab(this.tabs[0]);
        };
        Account.prototype.initTabs = function () {
            var modulePath = 'area/account/';
            this.tabs.push({
                id: 0,
                viewName: modulePath + 'accountPet',
                title: window.mltId.account_my_pet
            });
            this.tabs.push({
                id: 2,
                viewName: modulePath + 'accountSettings',
                title: window.mltId.account_settings
            });
        };
        return Account;
    })();
    return Account;
});
//# sourceMappingURL=account.js.map