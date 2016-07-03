define(["require", "exports", 'knockout'], function (require, exports, ko) {
    var Admin = (function () {
        function Admin() {
            var _this = this;
            this.activeTab = ko.observable(null);
            this.changeTab = function (tab) {
                _this.activeTab(tab);
            };
        }
        Admin.prototype.activate = function () {
            this.createTabs();
            this.changeTab(this.tabs[2]);
        };
        Admin.prototype.createTabs = function () {
            this.tabs = [
                {
                    name: 'Errors',
                    id: 1,
                    moduleId: 'area/admin/errors'
                },
                {
                    name: 'Connections',
                    id: 2,
                    moduleId: 'area/admin/connections'
                },
                {
                    name: 'Accounts',
                    id: 3,
                    moduleId: 'area/admin/accounts'
                },
                {
                    name: 'Cover',
                    id: 4,
                    moduleId: 'area/admin/cover'
                },
                {
                    name: 'Feedbacks',
                    id: 5,
                    moduleId: 'area/admin/feedbacks'
                }
            ];
        };
        return Admin;
    })();
    var Tab = (function () {
        function Tab() {
        }
        return Tab;
    })();
    return Admin;
});
//# sourceMappingURL=admin.js.map