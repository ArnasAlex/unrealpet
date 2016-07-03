define(["require", "exports"], function (require, exports) {
    var Account = (function () {
        function Account() {
            this.getAccount = '/account/getaccount';
            this.getAccountSettings = '/account/getaccountsettings';
            this.saveAccount = '/account/saveAccount';
            this.saveAccountSettings = '/account/saveAccountsettings';
            this.uploadAccountPicture = '/account/uploadaccountpicture';
            this.removeAccountPicture = '/account/removeaccountpicture';
        }
        return Account;
    })();
    var Activity = (function () {
        function Activity() {
            this.getRecentActivities = '/activity/getrecentactivities';
            this.clearRecentActivities = '/activity/clearrecentactivities';
            this.getUpdates = '/activity/getupdates';
        }
        return Activity;
    })();
    var Admin = (function () {
        function Admin() {
            this.getAccounts = '/admin/getaccounts';
            this.getConnections = '/admin/getconnections';
            this.getErrors = '/admin/geterrors';
            this.uploadCoverPicture = '/admin/uploadcoverpicture';
            this.getFeedbacks = '/admin/getfeedbacks';
        }
        return Admin;
    })();
    var Auth = (function () {
        function Auth() {
            this.login = '/auth/login';
            this.logout = '/auth/logout';
            this.signup = '/auth/signup';
        }
        return Auth;
    })();
    var Game = (function () {
        function Game() {
            this.chooseGameWinner = '/game/choosegamewinner';
            this.changePlayerStatus = '/game/changeplayerstatus';
            this.getPlayerEnergy = '/game/getplayerenergy';
            this.getGameFight = '/game/getgamefight';
            this.getGameFights = '/game/getgamefights';
            this.getGameLeaders = '/game/getGameLeaders';
            this.getPlayerInfo = '/game/getplayerinfo';
            this.openGift = '/game/opengift';
            this.updateFight = '/game/updatefight';
            this.uploadPlayerPicture = '/game/uploadplayerpicture';
        }
        return Game;
    })();
    var General = (function () {
        function General() {
            this.getMlt = '/general/getmlt';
            this.getCurrentUser = '/general/getcurrentuser';
            this.saveFeedback = '/general/savefeedback';
        }
        return General;
    })();
    var Post = (function () {
        function Post() {
            this.savePost = '/post/savepost';
            this.editPost = '/post/editpost';
            this.getPosts = '/post/getposts';
            this.getPost = '/post/getpost';
            this.getPetPosts = '/post/getpetposts';
            this.uploadPostPicture = '/post/uploadpostpicture';
            this.uploadPostVideo = '/post/uploadPostVideo';
            this.togglePostPaw = '/post/togglepostpaw';
            this.saveComment = '/post/savecomment';
            this.getComments = '/post/getcomments';
            this.togglePostCommentPaw = '/post/togglepostcommentpaw';
            this.editUploadedPostPicture = '/post/edituploadedpostpicture';
            this.getPetPostDetails = '/post/getpetpostdetails';
        }
        return Post;
    })();
    var Routes = (function () {
        function Routes() {
        }
        Routes.account = new Account();
        Routes.admin = new Admin();
        Routes.auth = new Auth();
        Routes.game = new Game();
        Routes.general = new General();
        Routes.post = new Post();
        Routes.activity = new Activity();
        return Routes;
    })();
    return Routes;
});
//# sourceMappingURL=routes.js.map