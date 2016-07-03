import mdb = require('mongodb');
import entity = require('./base/entity');

export class PlayerEntity extends entity.Entity implements entity.IAuditable {
    constructor() {
        super();
    }

    public static maxEnergy = 20;
    public static energyIncrementTime = 1000 * 60 * 15;

    public accountId: mdb.ObjectID;
    public pictureUrl: string;
    public fights: number;
    public win: number;
    public defeat: number;
    public points: number;
    public status: PlayerStatus;
    public lastFightOn: Date;
    public energy: number;
    public availableEnergy: number;
    public energyIncreasedOn: Date;
    public giftArrivesOn: Date;

    public createdOn: Date;
    public updatedOn: Date;
}

export var CollectionName = 'player';
