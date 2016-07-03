/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import searchOp = require('./searchPostsOperation');

export class GetPostsOperation extends operation.Operation {
    protected request: IGetPostsRequest;

    public execute(cb: (response: IGetPostsResponse) => void) {
        this.async.waterfall([
                this.executeGetPosts
            ],
            this.respond.bind(this, cb));
    }

    private executeGetPosts = (next) => {
        var allPostsQuery = {};

        var req: searchOp.ISearchPostsRequest = {
            query: allPostsQuery,
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

    private respond(cb: (response: IGetPetPostsResponse) => void, err, searchResponse: searchOp.ISearchPostsResponse) {
        var err = err ? err : searchResponse.error;
        var response = {
            error: err,
            list: searchResponse ? searchResponse.list : null
        };
        cb(response);
    }
}