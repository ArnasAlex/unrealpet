/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import searchOp = require('./searchPostsOperation');

export class GetPostOperation extends operation.Operation {
    protected request: IGetPostRequest;

    public execute(cb: (response: IGetPostResponse) => void) {
        this.async.waterfall([
                this.executeGetPost,
                this.fillEditAccess
            ],
            this.respond.bind(this, cb));
    }

    private executeGetPost = (next) => {
        var query = {_id: this.getObjectId(this.request.id)};

        var req: searchOp.ISearchPostsRequest = {
            query: query,
            skip: 0,
            take: 1,
            accountId: this.request.accountId
        };

        this.executeSearchOperation(req, next);
    };

    private executeSearchOperation(req: searchOp.ISearchPostsRequest, next) {
        new searchOp.SearchPostsOperation(req).execute((res: searchOp.ISearchPostsResponse) => {
            next(null, res);
        });
    }

    private fillEditAccess = (searchResponse: searchOp.ISearchPostsResponse, next) => {
        var post: IEditablePost = <any>searchResponse.list[0];
        if (!post){
            next(ErrorCodes.NotFound);
            return;
        }

        var userId = this.currentUserId();
        if (userId && (userId === post.ownerId || this.isAdmin())){
            post.canEdit = true;
        }

        next(searchResponse.error, post);
    };

    private respond(cb: (response: IGetPostResponse) => void, err, post: IEditablePost) {
        var response = {
            error: err,
            post: post
        };
        cb(response);
    }
}