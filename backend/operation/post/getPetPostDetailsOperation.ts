/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import accountEntity = require('../../entities/accountEntity');
import postEntity = require('../../entities/postEntity');
import playerEntity = require('../../entities/playerEntity');
import mongodb = require('mongodb');

export class GetPetPostDetailsOperation extends operation.Operation {
    protected request: IGetPetPostDetailsRequest;
    private cb: (response: IGetPetPostDetailsResponse) => void;
    private details: IPetPostDetails = <any>{};
    private accountId: mongodb.ObjectID;

    public execute(cb: (response: IGetPetPostDetailsResponse) => void) {
        this.cb = cb;
        this.async.waterfall([
                this.getAccount,
                this.getPostCount,
                this.getCommentCount,
                this.getPawCount,
                this.getUPPCount,
                this.getPlayerPicture
            ],
            this.respond);
    }

    private getAccount = (next) => {
        this.accountId = this.getObjectId(this.getOwnerId(this.request));
        if (!this.accountId){
            next(ErrorCodes.NotFound);
            return;
        }

        var query = {_id: this.accountId};
        this.findOne(accountEntity.CollectionName, query, (err: string, res: accountEntity.AccountEntity) => {
            if (!err){
                if (res){
                    this.details.about = res.about;
                    this.details.id = res._id.toString();
                    this.details.logoUrl = res.logo;
                    this.details.mainPictureUrl = res.picture;
                    this.details.name = res.name;
                    this.details.type = res.type;
                }
                else{
                    err = <any>ErrorCodes.NotFound;
                }
            }
            next(err);
        });
    };

    private getPostCount = (next) => {
        var query = {ownerId: this.accountId};
        this.db.collection(postEntity.CollectionName).count(query, (err, res) => {
            if (!err){
                this.details.posts = res;
            }
            next(err);
        });
    };

    private getCommentCount = (next) => {
        var pipeline = [
            {
                $match: {
                    $and: [
                        { ownerId: this.accountId },
                        {'comments.0': {$exists: true}}
                    ]
                }
            },
            { $unwind: "$comments" },
            { $group: {
                _id: null,
                count: { $sum: 1 }
            }}
        ];
        this.db.collection(postEntity.CollectionName).aggregate(pipeline, (err, res) => {
            if (!err){
                this.details.comments = res.length > 0 ? res[0].count : 0;
            }
            next(err);
        });
    };

    private getPawCount = (next) => {
        var pipeline = [
            {
                $match: {
                    $and: [
                        { ownerId: this.accountId },
                        {'paws.0': {$exists: true}}
                    ]
                }
            },
            { $unwind: "$paws" },
            { $group: {
                _id: null,
                count: { $sum: 1 }
            }}
        ];
        this.db.collection(postEntity.CollectionName).aggregate(pipeline, (err, res) => {
            if (!err){
                this.details.paws = res.length > 0 ? res[0].count : 0;
            }
            next(err);
        });
    };

    private getUPPCount = (next) => {
        var pipeline = [
            {
                $match: { ownerId: this.accountId }
            },
            { $group: {
                _id: null,
                count: { $sum: '$favs' }
            }}
        ];
        this.db.collection(postEntity.CollectionName).aggregate(pipeline, (err, res) => {
            if (!err){
                this.details.upps = res.length > 0 ? res[0].count : 0;
            }
            next(err);
        });
    };

    private getOwnerId(req: IGetPetPostDetailsRequest): string{
        var result = req.id ? req.id : req.accountId;
        return result;
    }

    private getPlayerPicture = (next) => {
        var query = {accountId: this.getObjectId(this.details.id)};
        this.findOne(playerEntity.CollectionName, query, (err, res: playerEntity.PlayerEntity) => {
            if (res){
                this.details.gamePictureUrl = res.pictureUrl;
            }

            next(err);
        });
    };

    private respond: any = (err) => {
        var response: IGetPetPostDetailsResponse = {
            error: err,
            details: err ? null : this.details
        };

        this.cb(response);
    }
}