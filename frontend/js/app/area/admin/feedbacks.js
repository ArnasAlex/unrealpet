var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", '../../routes', '../../core/components/adminSearchGrid/adminSearchGrid'], function (require, exports, routes, grid) {
    var Feedbacks = (function (_super) {
        __extends(Feedbacks, _super);
        function Feedbacks() {
            _super.apply(this, arguments);
        }
        Feedbacks.prototype.getUrl = function () {
            return routes.admin.getFeedbacks;
        };
        Feedbacks.prototype.updateListItem = function (item) {
            return new Feedback(item);
        };
        return Feedbacks;
    })(grid.AdminSearchGrid);
    var Feedback = (function () {
        function Feedback(dto) {
            this.id = dto.id;
            this.name = dto.name;
            this.ip = dto.ip;
            this.isHappy = dto.isHappy ? 'Happy' : 'Sad';
            this.message = dto.message;
            this.accountId = dto.accountId;
            var creation = dto.createdOn.replace('Z', '').split('T');
            this.createdOn = creation[0] + ' ' + creation[1];
        }
        return Feedback;
    })();
    return Feedbacks;
});
//# sourceMappingURL=feedbacks.js.map