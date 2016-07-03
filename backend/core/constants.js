var cfg = require('../config/environmentConfig');
var Constants = (function () {
    function Constants() {
    }
    Constants.getPictureUploadFolder = function () {
        if (!Constants.pictureUploadFolder) {
            Constants.pictureUploadFolder = Constants.getUploadFolder() + Constants.pictureFolder;
        }
        return Constants.pictureUploadFolder;
    };
    Constants.getCoverUploadFolder = function () {
        if (!Constants.coverUploadFolder) {
            Constants.coverUploadFolder = Constants.getUploadFolder() + Constants.coverFolder;
        }
        return Constants.coverUploadFolder;
    };
    Constants.getPlayerPictureUploadFolder = function () {
        if (!Constants.playerPictureUploadFolder) {
            Constants.playerPictureUploadFolder = Constants.getUploadFolder() + Constants.gameFolder;
        }
        return Constants.playerPictureUploadFolder;
    };
    Constants.getVideoUploadFolder = function () {
        if (!Constants.videoUploadFolder) {
            Constants.videoUploadFolder = Constants.getUploadFolder() + Constants.videoFolder;
        }
        return Constants.videoUploadFolder;
    };
    Constants.getOptimizedPictureFolder = function () {
        if (!Constants.pictureOptimizedFolder) {
            Constants.pictureOptimizedFolder = Constants.getUploadFolder() + Constants.optimizedPictureFolder;
        }
        return Constants.pictureOptimizedFolder;
    };
    Constants.getOptimizedVideoFolder = function () {
        if (!Constants.videoOptimizedFolder) {
            Constants.videoOptimizedFolder = Constants.getUploadFolder() + Constants.optimizedVideoFolder;
        }
        return Constants.videoOptimizedFolder;
    };
    Constants.getUploadFolder = function () {
        if (!Constants.uploadFolder) {
            Constants.uploadFolder = cfg.EnvironmentConfig.getConfig().uploadPath;
        }
        return Constants.uploadFolder;
    };
    Constants.getFilePathFromUrl = function (url) {
        var path = url.replace('/uploads', this.getUploadFolder());
        return path;
    };
    Constants.getUrlFromFilePath = function (filePath) {
        var url = filePath.replace(this.getUploadFolder(), '/uploads');
        return url;
    };
    Constants.changeFileExtension = function (file, ext) {
        var changed = file.substr(0, file.lastIndexOf('.') + 1) + ext;
        return changed;
    };
    Constants.addLogoToGmState = function (gmState) {
        var logoLocation = Constants.getRandomLogoLocation();
        return gmState
            .composite(Constants.logoImgPath)
            .gravity(logoLocation);
    };
    Constants.defaultPictureExtension = 'jpeg';
    Constants.pictureUploadFolderUrl = '/uploads/pictures/';
    Constants.pictureOptimizedFolderUrl = '/uploads/o/';
    Constants.videoUploadFolderUrl = '/uploads/videos/';
    Constants.videoOptimizedFolderUrl = '/uploads/v/';
    Constants.pictureFolder = '/pictures/';
    Constants.coverFolder = '/c/';
    Constants.gameFolder = '/g/';
    Constants.optimizedPictureFolder = '/o/';
    Constants.videoFolder = '/videos/';
    Constants.optimizedVideoFolder = '/v/';
    Constants.getRandomLogoLocation = function () {
        var val = Math.floor(Math.random() * 4);
        return Constants.logoLocations[val];
    };
    Constants.logoLocations = ['SouthEast', 'SouthWest', 'NorthWest', 'NorthEast'];
    Constants.logoImgPath = './frontend/img/unrealpetdomain.png';
    return Constants;
})();
exports.Constants = Constants;
//# sourceMappingURL=constants.js.map