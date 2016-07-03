import mdb = require('mongodb');
import entity = require('./base/entity');
import postEntity = require('./postEntity');

export class CommentEntity extends entity.Entity implements entity.IAuditable {
    constructor() {
        super();
    }
    public ownerId: mdb.ObjectID;
    public text: string;
    public paws: postEntity.PawEntity[];
    public parentCommentId: mdb.ObjectID;

    public createdOn: Date;
    public updatedOn: Date;
}