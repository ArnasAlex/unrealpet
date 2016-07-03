var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var feedbackEntity = require('../../entities/feedbackEntity');
var SaveFeedbackOperation = (function (_super) {
    __extends(SaveFeedbackOperation, _super);
    function SaveFeedbackOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.map = function (next) {
            var feedback = new feedbackEntity.FeedbackEntity();
            feedback.message = _this.request.message;
            feedback.isHappy = _this.request.isHappy;
            feedback.createdOn = new Date();
            feedback.ip = _this.expressRequest.ip;
            feedback.accountId = _this.getObjectId(_this.currentUserId());
            next(null, feedback);
        };
        this.saveFeedback = function (feedback, next) {
            _this.saveNonAuditable(feedbackEntity.CollectionName, feedback, next);
        };
        this.respond = function (err) {
            var response = {};
            if (err)
                response.error = err;
            _this.cb(response);
        };
    }
    SaveFeedbackOperation.prototype.execute = function (cb) {
        this.cb = cb;
        this.async.waterfall([
            this.map,
            this.saveFeedback
        ], this.respond);
    };
    return SaveFeedbackOperation;
})(operation.Operation);
exports.SaveFeedbackOperation = SaveFeedbackOperation;
//# sourceMappingURL=saveFeedbackOperation.js.map