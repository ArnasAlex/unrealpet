var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var cons = require('../../core/constants');
var gm = require('gm');
var EditUploadedPostPictureOperation = (function (_super) {
    __extends(EditUploadedPostPictureOperation, _super);
    function EditUploadedPostPictureOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.edit = function (next) {
            var picturePath = cons.Constants.getFilePathFromUrl(_this.request.url);
            var action = _this.getMethodFromAction();
            _this.executeOptimization(picturePath, action, next);
        };
    }
    EditUploadedPostPictureOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.edit,
        ], this.respond.bind(this, cb));
    };
    EditUploadedPostPictureOperation.prototype.executeOptimization = function (picturePath, editMethod, next) {
        var worker = gm(picturePath);
        editMethod(worker);
        worker.write(picturePath, function (err) {
            next(err);
        });
    };
    EditUploadedPostPictureOperation.prototype.getMethodFromAction = function () {
        var action = this.request.action;
        var result;
        switch (action) {
            case 1:
                result = function (state) { return state.rotate('black', -90); };
                break;
            case 2:
                result = function (state) { return state.rotate('black', 90); };
                break;
        }
        return result;
    };
    EditUploadedPostPictureOperation.prototype.respond = function (cb, err) {
        var response = {
            error: err
        };
        cb(response);
    };
    return EditUploadedPostPictureOperation;
})(operation.Operation);
exports.EditUploadedPostPictureOperation = EditUploadedPostPictureOperation;
//# sourceMappingURL=editUploadedPostPictureOperation.js.map