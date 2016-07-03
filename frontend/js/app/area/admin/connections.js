define(["require", "exports", 'knockout', '../../routes', '../../core/services/services'], function (require, exports, ko, routes, services) {
    var Connections = (function () {
        function Connections() {
            var _this = this;
            this.filter = ko.observable('');
            this.list = ko.observableArray([]);
            this.page = ko.observable(0);
            this.count = ko.observable(0);
            this.pageSize = 25;
            this.search = function () {
                _this.page(0);
                _this.getConnections();
            };
            this.next = function () {
                _this.page(_this.page() + 1);
                _this.getConnections();
            };
            this.prev = function () {
                var currentPage = _this.page();
                if (currentPage > 0) {
                    _this.page(currentPage - 1);
                }
                _this.getConnections();
            };
        }
        Connections.prototype.activate = function () {
            this.getConnections();
        };
        Connections.prototype.getConnections = function () {
            var _this = this;
            var request = {
                filter: this.filter(),
                skip: this.page() * this.pageSize,
                take: this.pageSize
            };
            services.server.get(routes.admin.getConnections, request).then(function (response) {
                _this.getCb(response);
            });
        };
        Connections.prototype.getCb = function (response) {
            var list = [];
            for (var i = 0; i < response.list.length; i++) {
                list.push(new Connection(response.list[i]));
            }
            this.list(list);
            if (this.page() === 0) {
                this.count(response.totalCount);
            }
        };
        return Connections;
    })();
    var Connection = (function () {
        function Connection(dto) {
            this.ip = dto.ip;
            this.action = dto.action;
            this.accountName = dto.accountName ? dto.accountName : '';
            var dateTime = dto.date.toString().replace('Z', '').split('T');
            this.date = dateTime[0];
            this.time = dateTime[1];
        }
        return Connection;
    })();
    return Connections;
});
//# sourceMappingURL=connections.js.map