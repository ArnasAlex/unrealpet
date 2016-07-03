import entity = require('./base/entity');

export class AccountEntity extends entity.Entity implements entity.IAuditable {
    constructor() {
        super();
    }
    public email: string;
    public password: string;
    public name: string;
    public type: PetType;
    public breed: string;
    public birthday: Date;
    public about: string;
    public picture: string;
    public logo: string;
    public roles: Role[];
    public google: IProvider;
    public facebook: IProvider;
    public master: IMaster;
    public settings: ISettings;

    public createdOn: Date;
    public updatedOn: Date;
}

export var CollectionName = 'account';

export interface IProvider {
    id: string;
}

export interface IMaster {
    name: string;
}

export interface ISettings {
    language: Language;
}