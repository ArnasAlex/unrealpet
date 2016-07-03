define(["require", "exports", 'knockout', '../../routes', '../../core/services/services'], function (require, exports, ko, routes, services) {
    var Accounts = (function () {
        function Accounts() {
            var _this = this;
            this.filter = ko.observable('');
            this.list = ko.observableArray([]);
            this.page = ko.observable(0);
            this.count = ko.observable(0);
            this.sort = ko.observable({ createdOn: -1 });
            this.pageSize = 25;
            this.search = function () {
                _this.page(0);
                _this.getAccounts();
            };
            this.next = function () {
                _this.page(_this.page() + 1);
                _this.getAccounts();
            };
            this.prev = function () {
                var currentPage = _this.page();
                if (currentPage > 0) {
                    _this.page(currentPage - 1);
                }
                _this.getAccounts();
            };
            this.sortCliked = function (evt) {
                var el = window.getTarget(evt);
                var column = el.attr('data-column');
                if (!column) {
                    return;
                }
                var currentSort = _this.sort();
                var newSort = null;
                if (currentSort && currentSort[column] !== undefined) {
                    newSort = currentSort;
                    newSort[column] *= -1;
                }
                else {
                    newSort = {};
                    newSort[column] = 1;
                }
                _this.sort(newSort);
                _this.getAccounts();
            };
        }
        Accounts.prototype.activate = function () {
            this.getAccounts();
        };
        Accounts.prototype.bindingComplete = function () {
            this.bindSort();
        };
        Accounts.prototype.deactivate = function () {
            this.unbindSort();
        };
        Accounts.prototype.getAccounts = function () {
            var _this = this;
            var request = {
                filter: this.filter(),
                skip: this.page() * this.pageSize,
                take: this.pageSize,
                sort: this.sort()
            };
            services.server.get(routes.admin.getAccounts, request).then(function (response) {
                _this.getCb(response);
            });
        };
        Accounts.prototype.getCb = function (response) {
            var list = [];
            for (var i = 0; i < response.list.length; i++) {
                list.push(new Account(response.list[i]));
            }
            this.list(list);
            if (this.page() === 0) {
                this.count(response.totalCount);
            }
        };
        Accounts.prototype.bindSort = function () {
            $('.admin-accounts table th').on('click', this.sortCliked);
        };
        Accounts.prototype.unbindSort = function () {
            $('.admin-accounts table th').off('click', this.sortCliked);
        };
        return Accounts;
    })();
    var Account = (function () {
        function Account(dto) {
            this.id = dto.id;
            this.name = dto.name;
            this.email = dto.email;
            this.master = dto.master ? dto.master : '';
            this.type = this.getLoginProviderName(dto.loginProvider);
            var creation = dto.createdOn.toString().replace('Z', '').split('T');
            this.createdOn = creation[0] + ' ' + creation[1];
            if (dto.lastActivityOn) {
                var activity = dto.lastActivityOn.toString().replace('Z', '').split('T');
                this.lastActivityOn = activity[0] + ' ' + activity[1];
            }
            else {
                this.lastActivityOn = null;
            }
        }
        Account.prototype.getLoginProviderName = function (provider) {
            switch (provider) {
                case 0:
                    return 'Email';
                case 2:
                    return 'Facebook';
                case 1:
                    return 'Google';
            }
        };
        return Account;
    })();
    return Accounts;
});
//# sourceMappingURL=accounts.js.map