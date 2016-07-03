/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import searchOp = require('./searchPostsOperation');

export class GetPetPostsOperation extends operation.Operation {
    protected request: IGetPetPostsRequest;

    public execute(cb: (response: IGetPetPostsResponse) => void) {
        this.async.waterfall([
                this.getQuery,
                this.executeGetPosts
            ],
            this.respond.bind(this, cb));
    }

    private getQuery = (next) => {
        var ownerId = this.getOwnerId(this.request);
        var ownerOId = ownerId ? this.getObjectId(ownerId) : null;
        if (!ownerOId){
            next(ErrorCodes.NotFound);
            return;
        }

        var query = {ownerId: ownerOId};
        next(null, query);
    };

    private executeGetPosts = (query, next) => {
        var req: searchOp.ISearchPostsRequest = {
            query: query,
            skip: this.request.skip,
            take: this.request.take,
            accountId: this.request.accountId
        };

        this.executeSearchOperation(req, next);
    };

    private executeSearchOperation(req: searchOp.ISearchPostsRequest, next) {
        new searchOp.SearchPostsOperation(req).execute((res: searchOp.ISearchPostsResponse) => {
            next(null, res);
        });
    }

    private getOwnerId(req: IGetPetPostsRequest): string{
        var result = req.id ? req.id : req.accountId;
        return result;
    }

    private respond(cb: (response: IGetPetPostsResponse) => void, err, searchResponse: searchOp.ISearchPostsResponse) {
        var err = err ? err : searchResponse.error;
        var response = {
            error: err,
            list: searchResponse ? searchResponse.list : null
        };
        cb(response);
    }
}