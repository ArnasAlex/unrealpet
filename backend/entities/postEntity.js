var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var entity = require('./base/entity');
var PostEntity = (function (_super) {
    __extends(PostEntity, _super);
    function PostEntity() {
        _super.call(this);
    }
    return PostEntity;
})(entity.Entity);
exports.PostEntity = PostEntity;
var PawEntity = (function () {
    function PawEntity() {
    }
    return PawEntity;
})();
exports.PawEntity = PawEntity;
exports.CollectionName = 'post';
exports.DeletedCollectionName = 'deletedpost';
//# sourceMappingURL=postEntity.js.map