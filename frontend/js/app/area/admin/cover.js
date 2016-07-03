define(["require", "exports", 'knockout', '../../routes'], function (require, exports, ko, routes) {
    var Cover = (function () {
        function Cover() {
            var _this = this;
            this.url = ko.observable('');
            this.refreshCover = function () {
                var coverUrl = '/uploads/c/cover.jpeg';
                var now = new Date().getTime();
                var url = coverUrl + '?bust=' + now;
                _this.url(url);
            };
        }
        Cover.prototype.activate = function () {
            var _this = this;
            this.refreshCover();
            this.uploadOptions = {
                uploadUrl: routes.admin.uploadCoverPicture,
                data: null,
                btnText: 'Upload Cover',
                uploadCb: function (response) {
                    if (!response.error) {
                        _this.refreshCover();
                    }
                },
                fileType: 1
            };
        };
        return Cover;
    })();
    return Cover;
});
//# sourceMappingURL=cover.js.map