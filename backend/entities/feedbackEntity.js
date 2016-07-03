var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var entity = require('./base/entity');
var FeedbackEntity = (function (_super) {
    __extends(FeedbackEntity, _super);
    function FeedbackEntity() {
        _super.call(this);
    }
    return FeedbackEntity;
})(entity.Entity);
exports.FeedbackEntity = FeedbackEntity;
exports.CollectionName = 'feedback';
//# sourceMappingURL=feedbackEntity.js.map