var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var errorEntity = require('../../entities/errorLogEntity');
var GetErrorsOperation = (function (_super) {
    __extends(GetErrorsOperation, _super);
    function GetErrorsOperation() {
        _super.apply(this, arguments);
    }
    GetErrorsOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.getErrors.bind(this),
            this.map.bind(this)
        ], this.respond.bind(this, cb));
    };
    GetErrorsOperation.prototype.getErrors = function (next) {
        var _this = this;
        var filter = this.getFilter();
        this.parseSearchRequest(this.request);
        this.db.collection(errorEntity.CollectionName)
            .find(filter)
            .sort({ createdOn: -1 })
            .skip(this.request.skip)
            .limit(this.request.take)
            .toArray(function (err, res) {
            if (err) {
                _this.logDbError(err);
                err = _this.defaultErrorMsg();
                next(err);
            }
            else {
                if (_this.request.skip === 0) {
                    _this.getTotalCount(filter, res, next);
                }
                else {
                    next(err, res, null);
                }
            }
        });
    };
    GetErrorsOperation.prototype.getTotalCount = function (filter, res, next) {
        this.db.collection(errorEntity.CollectionName).find(filter).count(false, function (err, count) {
            next(err, res, count);
        });
    };
    GetErrorsOperation.prototype.getFilter = function () {
        var result = {};
        var filter = this.request.filter;
        if (filter && filter.length > 0) {
            result = { message: new RegExp(filter, 'i') };
        }
        return result;
    };
    GetErrorsOperation.prototype.map = function (errors, totalCount, next) {
        var result = this._.map(errors, function (err) {
            return {
                id: err._id.toString(),
                message: err.message,
                type: err.type,
                date: err.createdOn
            };
        });
        next(null, result, totalCount);
    };
    GetErrorsOperation.prototype.respond = function (cb, err, errors, totalCount) {
        var response = {
            error: err,
            list: errors,
            totalCount: this.getNumberFromGetRequest(this.request.skip) === 0 ? totalCount : undefined
        };
        cb(response);
    };
    return GetErrorsOperation;
})(operation.Operation);
exports.GetErrorsOperation = GetErrorsOperation;
//# sourceMappingURL=getErrorsOperation.js.map