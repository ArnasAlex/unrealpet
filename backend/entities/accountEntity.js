var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var entity = require('./base/entity');
var AccountEntity = (function (_super) {
    __extends(AccountEntity, _super);
    function AccountEntity() {
        _super.call(this);
    }
    return AccountEntity;
})(entity.Entity);
exports.AccountEntity = AccountEntity;
exports.CollectionName = 'account';
//# sourceMappingURL=accountEntity.js.map