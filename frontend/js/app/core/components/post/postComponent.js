var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", '../base/component'], function (require, exports, component) {
    var PostComponent = (function (_super) {
        __extends(PostComponent, _super);
        function PostComponent() {
            _super.apply(this, arguments);
            this.name = 'post';
            this.createViewModel = function () {
                return new PostViewModel();
            };
            this.template = { require: this.getBaseTemplatePath() + '/post/postComponent.html' };
        }
        return PostComponent;
    })(component.Component);
    exports.PostComponent = PostComponent;
    var PostViewModel = (function () {
        function PostViewModel() {
        }
        PostViewModel.prototype.init = function (options, element) {
            this.data = options.data;
            this.container = options.container;
        };
        return PostViewModel;
    })();
});
//# sourceMappingURL=postComponent.js.map