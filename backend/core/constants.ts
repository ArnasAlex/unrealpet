import cfg = require('../config/environmentConfig');
import gm = require('gm');

export class Constants {
    public static defaultPictureExtension = 'jpeg';
    public static pictureUploadFolderUrl = '/uploads/pictures/';
    public static pictureOptimizedFolderUrl = '/uploads/o/';
    public static videoUploadFolderUrl = '/uploads/videos/';
    public static videoOptimizedFolderUrl = '/uploads/v/';
    private static pictureFolder = '/pictures/';
    private static coverFolder = '/c/';
    private static gameFolder = '/g/';
    private static optimizedPictureFolder = '/o/';
    private static videoFolder = '/videos/';
    private static optimizedVideoFolder = '/v/';
    private static uploadFolder: string;
    private static pictureUploadFolder: string;
    private static coverUploadFolder: string;
    private static playerPictureUploadFolder: string;
    private static videoUploadFolder: string;
    private static pictureOptimizedFolder: string;
    private static videoOptimizedFolder: string;

    public static getPictureUploadFolder() {
        if (!Constants.pictureUploadFolder){
            Constants.pictureUploadFolder = Constants.getUploadFolder() + Constants.pictureFolder;
        }

        return Constants.pictureUploadFolder;
    }

    public static getCoverUploadFolder() {
        if (!Constants.coverUploadFolder){
            Constants.coverUploadFolder = Constants.getUploadFolder() + Constants.coverFolder;
        }

        return Constants.coverUploadFolder;
    }

    public static getPlayerPictureUploadFolder() {
        if (!Constants.playerPictureUploadFolder){
            Constants.playerPictureUploadFolder = Constants.getUploadFolder() + Constants.gameFolder;
        }

        return Constants.playerPictureUploadFolder;
    }

    public static getVideoUploadFolder() {
        if (!Constants.videoUploadFolder){
            Constants.videoUploadFolder = Constants.getUploadFolder() + Constants.videoFolder;
        }

        return Constants.videoUploadFolder;
    }

    public static getOptimizedPictureFolder() {
        if (!Constants.pictureOptimizedFolder){
            Constants.pictureOptimizedFolder = Constants.getUploadFolder() + Constants.optimizedPictureFolder;
        }

        return Constants.pictureOptimizedFolder;
    }

    public static getOptimizedVideoFolder() {
        if (!Constants.videoOptimizedFolder){
            Constants.videoOptimizedFolder = Constants.getUploadFolder() + Constants.optimizedVideoFolder;
        }

        return Constants.videoOptimizedFolder;
    }

    public static getUploadFolder(){
        if (!Constants.uploadFolder){
            Constants.uploadFolder = cfg.EnvironmentConfig.getConfig().uploadPath;
        }

        return Constants.uploadFolder;
    }

    public static getFilePathFromUrl(url: string): string {
        var path = url.replace('/uploads', this.getUploadFolder());
        return path;
    }

    public static getUrlFromFilePath(filePath: string): string {
        var url = filePath.replace(this.getUploadFolder(), '/uploads');
        return url;
    }

    public static changeFileExtension(file: string, ext: string){
        var changed = file.substr(0, file.lastIndexOf('.') + 1) + ext;
        return changed;
    }

    public static addLogoToGmState(gmState: gm.State){
        var logoLocation = Constants.getRandomLogoLocation();
        return gmState
            .composite(Constants.logoImgPath)
            .gravity(logoLocation);
    }

    public static getRandomLogoLocation = () => {
        var val = Math.floor(Math.random() * 4);
        return Constants.logoLocations[val];
    };

    private static logoLocations = ['SouthEast', 'SouthWest', 'NorthWest', 'NorthEast'];
    private static logoImgPath = './frontend/img/unrealpetdomain.png';
}