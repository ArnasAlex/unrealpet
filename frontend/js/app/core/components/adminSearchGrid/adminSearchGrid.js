define(["require", "exports", 'knockout', '../../../core/services/services'], function (require, exports, ko, services) {
    var AdminSearchGrid = (function () {
        function AdminSearchGrid() {
            var _this = this;
            this.filter = ko.observable('');
            this.list = ko.observableArray([]);
            this.page = ko.observable(0);
            this.count = ko.observable(0);
            this.sort = ko.observable();
            this.pageSize = 25;
            this.search = function () {
                _this.page(0);
                _this.get();
            };
            this.next = function () {
                _this.page(_this.page() + 1);
                _this.get();
            };
            this.prev = function () {
                var currentPage = _this.page();
                if (currentPage > 0) {
                    _this.page(currentPage - 1);
                }
                _this.get();
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
                _this.get();
            };
        }
        AdminSearchGrid.prototype.activate = function () {
            this.get();
        };
        AdminSearchGrid.prototype.bindingComplete = function () {
            this.bindSort();
        };
        AdminSearchGrid.prototype.deactivate = function () {
            this.unbindSort();
        };
        AdminSearchGrid.prototype.getUrl = function () {
            throw Error('implement getUrl method');
        };
        AdminSearchGrid.prototype.createRequest = function () {
            var request = {
                filter: this.filter(),
                skip: this.page() * this.pageSize,
                take: this.pageSize,
                sort: this.sort()
            };
            return request;
        };
        AdminSearchGrid.prototype.updateListItem = function (item) {
            return item;
        };
        AdminSearchGrid.prototype.get = function () {
            var _this = this;
            var req = this.createRequest();
            services.server.get(this.getUrl(), req).then(function (response) {
                _this.getCb(response);
            });
        };
        AdminSearchGrid.prototype.getCb = function (response) {
            var list = [];
            for (var i = 0; i < response.list.length; i++) {
                var item = this.updateListItem(response.list[i]);
                list.push(item);
            }
            this.list(list);
            if (this.page() === 0) {
                this.count(response.totalCount);
            }
        };
        AdminSearchGrid.prototype.bindSort = function () {
            $('.admin-search-grid table th').on('click', this.sortCliked);
        };
        AdminSearchGrid.prototype.unbindSort = function () {
            $('.admin-search-grid table th').off('click', this.sortCliked);
        };
        return AdminSearchGrid;
    })();
    exports.AdminSearchGrid = AdminSearchGrid;
});
//# sourceMappingURL=adminSearchGrid.js.map