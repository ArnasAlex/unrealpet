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
                _this.getErrors();
            };
            this.next = function () {
                _this.page(_this.page() + 1);
                _this.getErrors();
            };
            this.prev = function () {
                var currentPage = _this.page();
                if (currentPage > 0) {
                    _this.page(currentPage - 1);
                }
                _this.getErrors();
            };
        }
        Connections.prototype.activate = function () {
            this.getErrors();
        };
        Connections.prototype.getErrors = function () {
            var _this = this;
            var request = {
                filter: this.filter(),
                skip: this.page() * this.pageSize,
                take: this.pageSize
            };
            services.server.get(routes.admin.getErrors, request).then(function (response) {
                _this.getCb(response);
            });
        };
        Connections.prototype.getCb = function (response) {
            var list = [];
            for (var i = 0; i < response.list.length; i++) {
                list.push(new Error(response.list[i]));
            }
            this.list(list);
            if (this.page() === 0) {
                this.count(response.totalCount);
            }
        };
        return Connections;
    })();
    var Error = (function () {
        function Error(dto) {
            this.id = dto.id;
            this.type = this.getErrorTypeName(dto.type);
            this.message = dto.message;
            var dateTime = dto.date.toString().replace('Z', '').split('T');
            this.date = dateTime[0];
            this.time = dateTime[1];
        }
        Error.prototype.getErrorTypeName = function (type) {
            switch (type) {
                case 3:
                    return 'Critical';
                case 2:
                    return 'Normal';
                case 1:
                    return 'Warning';
            }
            return 'Unknown';
        };
        return Error;
    })();
    return Connections;
});
//# sourceMappingURL=errors.js.map