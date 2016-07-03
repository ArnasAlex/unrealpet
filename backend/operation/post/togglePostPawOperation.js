var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/refs.d.ts" />
var operation = require('../base/operation');
var postEntity = require('../../entities/postEntity');
var activityEntity = require('../../entities/activityEntity');
var TogglePostPawOperation = (function (_super) {
    __extends(TogglePostPawOperation, _super);
    function TogglePostPawOperation() {
        var _this = this;
        _super.apply(this, arguments);
        this.getPost = function (next) {
            _this.findOne(postEntity.CollectionName, { _id: _this.getObjectId(_this.request.postId) }, function (err, res) {
                _this.post = res;
                next(err);
            });
        };
        this.togglePaw = function (next) {
            var isPawSet = false;
            var accountId = _this.currentUserObjectId();
            var paw = new postEntity.PawEntity();
            paw.ownerId = accountId;
            paw.createdOn = new Date();
            if (!_this.post.paws || _this.post.paws.length === 0) {
                isPawSet = true;
                _this.post.paws = [paw];
            }
            else {
                var index = _this._.findIndex(_this.post.paws, function (paw) {
                    return paw.ownerId.equals(accountId);
                });
                if (index === -1) {
                    isPawSet = true;
                    _this.post.paws.push(paw);
                }
                else {
                    _this.post.paws.splice(index, 1);
                }
            }
            _this.updatePostFavs(_this.post, isPawSet);
            _this.isPawSet = isPawSet;
            next();
        };
        this.savePost = function (next) {
            _this.save(postEntity.CollectionName, _this.post, function (err, res) {
                next(err);
            });
        };
        this.addRemoveActivityForPostOwner = function (next) {
            var query = new activityEntity.ActivityEntity();
            query.accountId = _this.post.ownerId;
            query.type = 2;
            query.relatedId = _this.post._id;
            query.data = { pawOwnerId: _this.currentUserObjectId() };
            _this.findOne(activityEntity.CollectionName, query, function (err, res) {
                if (err) {
                    _this.logDbError(err, activityEntity.CollectionName);
                }
                else {
                    if (!res && _this.isPawSet) {
                        _this.insertActivity();
                    }
                    else if (res && !_this.isPawSet) {
                        _this.remove(activityEntity.CollectionName, { _id: res._id }, function () { });
                    }
                }
            });
            next();
        };
    }
    TogglePostPawOperation.prototype.execute = function (cb) {
        this.async.waterfall([
            this.getPost,
            this.togglePaw,
            this.savePost,
            this.addRemoveActivityForPostOwner
        ], this.respond.bind(this, cb));
    };
    TogglePostPawOperation.prototype.updatePostFavs = function (post, isPawSet) {
        var favDiff = isPawSet ? 1 : -1;
        post.favs += favDiff;
    };
    TogglePostPawOperation.prototype.insertActivity = function () {
        if (this.post.ownerId.toString() === this.currentUserId()) {
            return;
        }
        var activity = new activityEntity.ActivityEntity();
        activity.accountId = this.post.ownerId;
        activity.createdOn = new Date();
        activity.title = this.post.title;
        activity.type = 2;
        activity.relatedId = this.post._id;
        this.db.collection(activityEntity.CollectionName).insert(activity, function () { });
    };
    TogglePostPawOperation.prototype.respond = function (cb, err) {
        var response = {
            error: err,
            isPawSet: this.isPawSet
        };
        cb(response);
    };
    return TogglePostPawOperation;
})(operation.Operation);
exports.TogglePostPawOperation = TogglePostPawOperation;
//# sourceMappingURL=togglePostPawOperation.js.map