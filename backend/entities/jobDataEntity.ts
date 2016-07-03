import entity = require('./base/entity');

export class JobDataEntity extends entity.Entity implements entity.IAuditable {
    constructor() {
        super();
    }
    public type: JobType;
    public status: JobDataStatus;
    public data: any;
    public start: Date;
    public end: Date;
    public failCount: number;

    public createdOn: Date;
    public updatedOn: Date;
}

export var CollectionName = 'jobdata';

export const enum JobType {
    FileOptimization = 1
}

export const enum JobDataStatus {
    Created = 1,
    InProgress = 2,
    Success = 3,
    Fail = 4
}

export interface IFileOptimizationJobData {
    name: string;
    type: FileOptimizationType;
}

export const enum FileOptimizationType {
    PostPicture = 1,
    AccountLogo = 2,
    PostVideo = 3,
    AccountMainPicture = 4
}

export interface IFileProperties {
    size: number;
    dimensions: string;
}