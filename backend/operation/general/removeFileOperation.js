var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var fs = require('fs');
var RemoveFileOperation = (function (_super) {
    __extends(RemoveFileOperation, _super);
    function RemoveFileOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.existsFile = function (next) {
            _this.fsExists(_this.request.filePath, next);
        };
        this.removeFile = function (pathExists, next) {
            if (!pathExists) {
                next(null);
                return;
            }
            _this.fsUnlink(_this.request.filePath, next);
        };
    }
    RemoveFileOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.existsFile,
            this.removeFile
        ], this.respond.bind(this, cb));
    };
    RemoveFileOperation.prototype.fsExists = function (path, next) {
        fs.exists(this.request.filePath, function (exists) {
            next(null, exists);
        });
    };
    RemoveFileOperation.prototype.fsUnlink = function (path, cb) {
        var _this = this;
        fs.unlink(path, function (err) {
            if (err) {
                _this.logError('Unable to unlink file. Path: ' + path + ', error: ' + err);
            }
            cb(err);
        });
    };
    RemoveFileOperation.prototype.respond = function (cb, err) {
        var response = { error: err };
        cb(response);
    };
    return RemoveFileOperation;
})(operation.Operation);
exports.RemoveFileOperation = RemoveFileOperation;
//# sourceMappingURL=removeFileOperation.js.map