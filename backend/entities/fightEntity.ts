import mdb = require('mongodb');
import entity = require('./base/entity');

export class FightEntity extends entity.Entity implements entity.IAuditable {
    constructor() {
        super();
    }

    public player1Id: mdb.ObjectID;
    public player2Id: mdb.ObjectID;
    public voterId: mdb.ObjectID;
    public voterIp: string;
    public winnerId: mdb.ObjectID;
    public status: FightStatus;
    public playerId: mdb.ObjectID;
    public player1Points: number;
    public player2Points: number;

    public createdOn: Date;
    public updatedOn: Date;
}

export var CollectionName = 'fight';
