class Account {
    public getAccount = '/account/getaccount';
    public getAccountSettings = '/account/getaccountsettings';
    public saveAccount = '/account/saveAccount';
    public saveAccountSettings = '/account/saveAccountsettings';
    public uploadAccountPicture = '/account/uploadaccountpicture';
    public removeAccountPicture = '/account/removeaccountpicture';
}

class Activity {
    public getRecentActivities = '/activity/getrecentactivities';
    public clearRecentActivities = '/activity/clearrecentactivities';
    public getUpdates = '/activity/getupdates';
}

class Admin {
    public getAccounts = '/admin/getaccounts';
    public getConnections = '/admin/getconnections';
    public getErrors = '/admin/geterrors';
    public uploadCoverPicture = '/admin/uploadcoverpicture';
    public getFeedbacks = '/admin/getfeedbacks';
}

class Auth {
    public login = '/auth/login';
    public logout = '/auth/logout';
    public signup = '/auth/signup';
}

class Game {
    public chooseGameWinner = '/game/choosegamewinner';
    public changePlayerStatus = '/game/changeplayerstatus';
    public getPlayerEnergy = '/game/getplayerenergy';
    public getGameFight = '/game/getgamefight';
    public getGameFights = '/game/getgamefights';
    public getGameLeaders = '/game/getGameLeaders';
    public getPlayerInfo = '/game/getplayerinfo';
    public openGift = '/game/opengift';
    public updateFight = '/game/updatefight';
    public uploadPlayerPicture = '/game/uploadplayerpicture';
}

class General {
    public getMlt = '/general/getmlt';
    public getCurrentUser = '/general/getcurrentuser';
    public saveFeedback = '/general/savefeedback';
}

class Post {
    public savePost = '/post/savepost';
    public editPost = '/post/editpost';
    public getPosts = '/post/getposts';
    public getPost = '/post/getpost';
    public getPetPosts = '/post/getpetposts';
    public uploadPostPicture = '/post/uploadpostpicture';
    public uploadPostVideo = '/post/uploadPostVideo';
    public togglePostPaw = '/post/togglepostpaw';
    public saveComment = '/post/savecomment';
    public getComments = '/post/getcomments';
    public togglePostCommentPaw = '/post/togglepostcommentpaw';
    public editUploadedPostPicture = '/post/edituploadedpostpicture';
    public getPetPostDetails = '/post/getpetpostdetails';
}

class Routes {
    public static account = new Account();
    public static admin = new Admin();
    public static auth = new Auth();
    public static game = new Game();
    public static general = new General();
    public static post = new Post();
    public static activity = new Activity();
}

export = Routes;