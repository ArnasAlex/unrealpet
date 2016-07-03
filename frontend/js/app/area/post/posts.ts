/// <reference path='../../../typings/refs.d.ts' />
import ko = require('knockout');
import services = require('../../core/services/services');
import router = require('plugins/router');
import routes = require('../../routes');
import _ = require('lodash');

class Posts {
    gridOptions: Components.IPostSearchGridOptions;
    wrongUrl = ko.observable(false);
    id = ko.observable('');
    details = ko.observable<PetPostDetails>(null);
    isOwnerViewing = ko.observable(false);
    activities = ko.observable(null);
    isMainPictureShown = ko.observable(true);

    private shouldExecuteGetPosts = false;

    constructor() {
        this.init();
    }

    activate(petId: string) {
        this.id(petId);
        this.getPetDetails();
        this.isOwnerViewing(!petId);
        this.getRecentActivities();
    }

    deactivate(){
        this.gridOptions.component.destroy();
    }

    mainPictureButtonClick = () => {
        this.isMainPictureShown(true);
    };

    gamePictureButtonClick = () => {
        this.isMainPictureShown(false);
    };

    private init() {
        this.gridOptions = {
            url: routes.post.getPetPosts,
            getRequest: this.getSearchRequest,
            manualStart: true,
            onInit: () => { this.getPosts(); }
        };
    }

    private getRecentActivities(){
        if (this.isOwnerViewing()){
            this.activities(new Activities());
            this.activities().refresh();
        }
    }

    private getPetDetails() {
        var req = {
            id: this.id()
        };

        services.server.get(routes.post.getPetPostDetails, req).then(this.getPetDetailsCb);
    }

    private getPetDetailsCb = (response: IGetPetPostDetailsResponse) => {
        if (response.error){
            this.onErrorResponse(response);
            return;
        }

        this.details(new PetPostDetails(response.details));
        this.getPosts();
    };

    private getPosts(){
        if (!this.shouldExecuteGetPosts){
            this.shouldExecuteGetPosts = true;
        } else{
            this.gridOptions.component.start();
        }
    }

    private getSearchRequest = (): any => {
        var req = {
            id: this.id()
        };

        return req;
    };

    private onErrorResponse = (response: IGetPetPostDetailsResponse) => {
        var err: any = response.error;
        if (err == ErrorCodes.NotFound){
            this.wrongUrl(true);
        }
        else {
            services.ui.showAlert({
                msg: err,
                type: AlertType.Danger
            });
        }
    }
}

export = Posts;

class PetPostDetails implements IPetPostDetails {
    id: string;
    name: string;
    upps: number;
    paws: number;
    comments: number;
    posts: number;
    mainPictureUrl: string;
    gamePictureUrl: string;
    logoUrl: string;
    about: string;
    type: PetType;
    typeText: string;
    showUploadPictureSuggestion: boolean;

    constructor(details: IPetPostDetails){
        this.about = '';
        this.mainPictureUrl = '';
        this.logoUrl = '';
        _.assign(this, details);

        this.gamePictureUrl = this.gamePictureUrl
            ? 'url(' + this.gamePictureUrl + ')'
            : '';

        this.typeText = details.type !== PetType.Other
            ? _.find(services.enum.petTypes, x => x.value === details.type).name
            : '';
    }
}

class Activity {
    postId: string;
    title: string;
    message: string;
    type: ActivityType;

    constructor(activity: IRecentActivity){
        this.postId = activity.relatedId;
        this.message = activity.message;
        this.title = activity.title;
        this.type = activity.type;
    }
}

class MyPostActivity extends Activity {
    paws: number;
    comments: number;
    isMyPost: boolean;

    constructor(activity: IRecentActivity){
        super(activity);

        this.paws = 0;
        this.comments = 0;
        this.isMyPost = true;
    }
}

class OthersPostActivity extends Activity {
    comments: number;
    isOthersPost: boolean;

    constructor(activity: IRecentActivity){
        super(activity);

        this.isOthersPost = true;
        this.comments = 0;
    }
}

class Activities {
    list: KnockoutObservableArray<Activity> = ko.observableArray([]);

    goToActivity = (activity: Activity) => {
        services.nav.goToUrl('#/post/' + activity.postId);
    };

    clear = () => {
        services.server.post(routes.activity.clearRecentActivities, {}).then(() => {
            this.list([]);
            services.currentAccount.hasActivities(false);
        });
    };

    refresh = () => {
        services.server.get(routes.activity.getRecentActivities, {}).then((response: IGetRecentPostActivitiesResponse) => {
            var list = this.mapActivities(response.list);
            this.list(list);
        });
    };

    private mapActivities(activities: IRecentActivity[]){
        var list: Activity[] = [];
        _.each(activities, (activity: IRecentActivity) => {
            if (activity.type === ActivityType.MyPostComment || activity.type === ActivityType.MyPostPaw){
                var existingActivity: MyPostActivity = <any>_.find(list, x => x.postId === activity.relatedId);
                if (!existingActivity){
                    existingActivity = new MyPostActivity(activity);
                    list.push(existingActivity);
                }
                if (activity.type === ActivityType.MyPostComment){
                    if (!existingActivity.message){
                        existingActivity.message = activity.message;
                    }
                    existingActivity.comments++;
                }

                if (activity.type === ActivityType.MyPostPaw){
                    existingActivity.paws++;
                }
            }

            if (activity.type === ActivityType.OthersPostComment){
                var existingOthersActivity: OthersPostActivity = <any>_.find(list, x => x.postId === activity.relatedId);
                if (!existingOthersActivity){
                    existingOthersActivity = new OthersPostActivity(activity);
                    list.push(existingOthersActivity);
                }

                if (!existingOthersActivity.message){
                    existingOthersActivity.message = activity.message;
                }
                existingOthersActivity.comments++;
            }
        });

        return list;
    }
}