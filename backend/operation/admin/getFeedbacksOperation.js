var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var accountEntity = require('../../entities/accountEntity');
var feedbackEntity = require('../../entities/feedbackEntity');
var GetFeedbacksOperation = (function (_super) {
    __extends(GetFeedbacksOperation, _super);
    function GetFeedbacksOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.response = {};
        this.getFeedbacks = function (next) {
            var filter = _this.getFilter();
            var skip = _this.getNumberFromGetRequest(_this.request.skip);
            _this.db.collection(feedbackEntity.CollectionName)
                .find(filter)
                .sort({ createdOn: -1 })
                .skip(skip)
                .limit(_this.getNumberFromGetRequest(_this.request.take))
                .toArray(function (err, res) {
                if (err) {
                    _this.logDbError(err);
                    err = _this.defaultErrorMsg();
                    next(err);
                }
                else {
                    if (skip === 0) {
                        _this.getTotalCount(filter, res, next);
                    }
                    else {
                        next(err, res);
                    }
                }
            });
        };
        this.map = function (feedbacks, next) {
            var result = [];
            for (var i = 0; i < feedbacks.length; i++) {
                var feed = feedbacks[i];
                var feedback = {
                    id: feed._id.toString(),
                    accountId: feed.accountId ? feed.accountId.toString() : null,
                    name: '',
                    ip: feed.ip,
                    createdOn: feed.createdOn,
                    isHappy: feed.isHappy,
                    message: feed.message
                };
                result.push(feedback);
            }
            _this.response.list = result;
            next(null);
        };
        this.fillAccounts = function (next) {
            var ids = _this._.map(_this.response.list, function (x) { return _this.getObjectId(x.accountId); });
            ids = _this._.uniq(ids);
            var query = {
                _id: { $in: ids }
            };
            var cb = function (err, res) {
                if (!err) {
                    _this._.forEach(_this.response.list, function (feedback) {
                        if (feedback.accountId) {
                            var account = _this._.find(res, function (x) { return x._id.toString() === feedback.accountId; });
                            if (account) {
                                feedback.name = account.name;
                            }
                        }
                    });
                }
                next(err);
            };
            _this.db.collection(accountEntity.CollectionName).find(query).toArray(cb);
        };
        this.respond = function (err) {
            if (err)
                _this.response.error = err;
            _this.cb(_this.response);
        };
    }
    GetFeedbacksOperation.prototype.execute = function (cb) {
        this.cb = cb;
        this.async.waterfall([
            this.getFeedbacks,
            this.map,
            this.fillAccounts
        ], this.respond);
    };
    GetFeedbacksOperation.prototype.getTotalCount = function (filter, feedbacks, next) {
        var _this = this;
        this.db.collection(feedbackEntity.CollectionName).find(filter).count(false, function (err, count) {
            _this.response.totalCount = count;
            next(err, feedbacks);
        });
    };
    GetFeedbacksOperation.prototype.getFilter = function () {
        var result = {};
        var filter = this.request.filter;
        if (filter && filter.length > 0) {
            result = {
                $or: [
                    { ip: new RegExp(filter, 'i') },
                    { message: new RegExp(filter, 'i') }
                ]
            };
        }
        return result;
    };
    return GetFeedbacksOperation;
})(operation.Operation);
exports.GetFeedbacksOperation = GetFeedbacksOperation;
//# sourceMappingURL=getFeedbacksOperation.js.map