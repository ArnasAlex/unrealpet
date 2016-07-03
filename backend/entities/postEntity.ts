import mdb = require('mongodb');
import entity = require('./base/entity');
import commentEntity = require('./commentEntity');

export class PostEntity extends entity.Entity implements entity.IAuditable {
    constructor() {
        super();
    }

    public title: string;
    public ownerId: mdb.ObjectID;
    public pictureUrl: string;
    public pictureType: PostContentType;
    public paws: PawEntity[];
    public comments: commentEntity.CommentEntity[];
    public favs: number;
    public ownerViewedOn: Date;

    public createdOn: Date;
    public updatedOn: Date;
}

export class PawEntity {
    ownerId: mdb.ObjectID;
    createdOn: Date;
}

export var CollectionName = 'post';
export var DeletedCollectionName = 'deletedpost';