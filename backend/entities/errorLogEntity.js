var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../typings/refs.d.ts" />
var entity = require('./base/entity');
var ErrorLogEntity = (function (_super) {
    __extends(ErrorLogEntity, _super);
    function ErrorLogEntity() {
        _super.call(this);
    }
    return ErrorLogEntity;
})(entity.Entity);
exports.ErrorLogEntity = ErrorLogEntity;
exports.CollectionName = 'errorlog';
//# sourceMappingURL=errorLogEntity.js.map