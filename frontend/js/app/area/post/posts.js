var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'knockout', '../../core/services/services', '../../routes', 'lodash'], function (require, exports, ko, services, routes, _) {
    var Posts = (function () {
        function Posts() {
            var _this = this;
            this.wrongUrl = ko.observable(false);
            this.id = ko.observable('');
            this.details = ko.observable(null);
            this.isOwnerViewing = ko.observable(false);
            this.activities = ko.observable(null);
            this.isMainPictureShown = ko.observable(true);
            this.shouldExecuteGetPosts = false;
            this.mainPictureButtonClick = function () {
                _this.isMainPictureShown(true);
            };
            this.gamePictureButtonClick = function () {
                _this.isMainPictureShown(false);
            };
            this.getPetDetailsCb = function (response) {
                if (response.error) {
                    _this.onErrorResponse(response);
                    return;
                }
                _this.details(new PetPostDetails(response.details));
                _this.getPosts();
            };
            this.getSearchRequest = function () {
                var req = {
                    id: _this.id()
                };
                return req;
            };
            this.onErrorResponse = function (response) {
                var err = response.error;
                if (err == 2 /* NotFound */) {
                    _this.wrongUrl(true);
                }
                else {
                    services.ui.showAlert({
                        msg: err,
                        type: 3 /* Danger */
                    });
                }
            };
            this.init();
        }
        Posts.prototype.activate = function (petId) {
            this.id(petId);
            this.getPetDetails();
            this.isOwnerViewing(!petId);
            this.getRecentActivities();
        };
        Posts.prototype.deactivate = function () {
            this.gridOptions.component.destroy();
        };
        Posts.prototype.init = function () {
            var _this = this;
            this.gridOptions = {
                url: routes.post.getPetPosts,
                getRequest: this.getSearchRequest,
                manualStart: true,
                onInit: function () {
                    _this.getPosts();
                }
            };
        };
        Posts.prototype.getRecentActivities = function () {
            if (this.isOwnerViewing()) {
                this.activities(new Activities());
                this.activities().refresh();
            }
        };
        Posts.prototype.getPetDetails = function () {
            var req = {
                id: this.id()
            };
            services.server.get(routes.post.getPetPostDetails, req).then(this.getPetDetailsCb);
        };
        Posts.prototype.getPosts = function () {
            if (!this.shouldExecuteGetPosts) {
                this.shouldExecuteGetPosts = true;
            }
            else {
                this.gridOptions.component.start();
            }
        };
        return Posts;
    })();
    var PetPostDetails = (function () {
        function PetPostDetails(details) {
            this.about = '';
            this.mainPictureUrl = '';
            this.logoUrl = '';
            _.assign(this, details);
            this.gamePictureUrl = this.gamePictureUrl ? 'url(' + this.gamePictureUrl + ')' : '';
            this.typeText = details.type !== 1 /* Other */ ? _.find(services.enum.petTypes, function (x) { return x.value === details.type; }).name : '';
        }
        return PetPostDetails;
    })();
    var Activity = (function () {
        function Activity(activity) {
            this.postId = activity.relatedId;
            this.message = activity.message;
            this.title = activity.title;
            this.type = activity.type;
        }
        return Activity;
    })();
    var MyPostActivity = (function (_super) {
        __extends(MyPostActivity, _super);
        function MyPostActivity(activity) {
            _super.call(this, activity);
            this.paws = 0;
            this.comments = 0;
            this.isMyPost = true;
        }
        return MyPostActivity;
    })(Activity);
    var OthersPostActivity = (function (_super) {
        __extends(OthersPostActivity, _super);
        function OthersPostActivity(activity) {
            _super.call(this, activity);
            this.isOthersPost = true;
            this.comments = 0;
        }
        return OthersPostActivity;
    })(Activity);
    var Activities = (function () {
        function Activities() {
            var _this = this;
            this.list = ko.observableArray([]);
            this.goToActivity = function (activity) {
                services.nav.goToUrl('#/post/' + activity.postId);
            };
            this.clear = function () {
                services.server.post(routes.activity.clearRecentActivities, {}).then(function () {
                    _this.list([]);
                    services.currentAccount.hasActivities(false);
                });
            };
            this.refresh = function () {
                services.server.get(routes.activity.getRecentActivities, {}).then(function (response) {
                    var list = _this.mapActivities(response.list);
                    _this.list(list);
                });
            };
        }
        Activities.prototype.mapActivities = function (activities) {
            var list = [];
            _.each(activities, function (activity) {
                if (activity.type === 0 /* MyPostComment */ || activity.type === 2 /* MyPostPaw */) {
                    var existingActivity = _.find(list, function (x) { return x.postId === activity.relatedId; });
                    if (!existingActivity) {
                        existingActivity = new MyPostActivity(activity);
                        list.push(existingActivity);
                    }
                    if (activity.type === 0 /* MyPostComment */) {
                        if (!existingActivity.message) {
                            existingActivity.message = activity.message;
                        }
                        existingActivity.comments++;
                    }
                    if (activity.type === 2 /* MyPostPaw */) {
                        existingActivity.paws++;
                    }
                }
                if (activity.type === 1 /* OthersPostComment */) {
                    var existingOthersActivity = _.find(list, function (x) { return x.postId === activity.relatedId; });
                    if (!existingOthersActivity) {
                        existingOthersActivity = new OthersPostActivity(activity);
                        list.push(existingOthersActivity);
                    }
                    if (!existingOthersActivity.message) {
                        existingOthersActivity.message = activity.message;
                    }
                    existingOthersActivity.comments++;
                }
            });
            return list;
        };
        return Activities;
    })();
    return Posts;
});
//# sourceMappingURL=posts.js.map