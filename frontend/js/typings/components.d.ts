/// <reference path='./refs.d.ts' />
declare module Components {
    interface IComponent {
        name: string;
        createViewModel(): IComponentViewModel;
        template: string | IRequiredTemplate;
    }

    interface IRequiredTemplate {
        require: string;
    }

    interface IComponentViewModel {
        init(options, element: JQuery): void;
    }

    interface IUploadButtonComponentOptions {
        uploadUrl: string;
        data: KnockoutObservable<any>|any;
        btnText: KnockoutObservable<string> | string;
        uploadCb: (response: IResponse) => void;
        fileType: UploadFileType;
        progress?: KnockoutObservable<UploadProgress>;
        progressPercent?: KnockoutObservable<number>;
    }

    interface IPostSearchGridOptions {
        component?: IPostSearchGrid;
        url: string;
        getRequest: () => IGetPostsRequest;
        onRequestError?: (response: IGetPostsResponse) => void;
        manualStart?: boolean;
        onInit?: () => void;
    }

    interface IPostSearchGrid{
        destroy();
        start();
    }

    interface IVoteGameOptions {
        showPlayButton: boolean;
        energyChangedCb: (energy: number) => void;
        refreshEnergy: () => void;
    }
}

declare const enum UploadProgress {
    NoAction = 0,
    Progress = 1,
    Success = 2,
    Error = 3
}

declare const enum UploadFileType {
    Picture = 1,
    Video = 2
}