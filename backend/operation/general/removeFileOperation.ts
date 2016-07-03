/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import fs = require('fs');
import cons = require('../../core/constants');

export class RemoveFileOperation extends operation.Operation {
    protected request: IRemoveFileRequest;

    public execute(cb: (response: IRemoveFileResponse) => void) {
        this.async.waterfall([
                this.existsFile,
                this.removeFile
            ],
            this.respond.bind(this, cb));
    }

    private existsFile = (next) => {
        this.fsExists(this.request.filePath, next);
    };

    private fsExists(path, next){
        fs.exists(this.request.filePath, (exists) => {
            next(null, exists);
        });
    }

    private removeFile = (pathExists: boolean, next) => {
        if (!pathExists){
            next(null);
            return;
        }

        this.fsUnlink(this.request.filePath, next);
    };

    private fsUnlink(path, cb){
        fs.unlink(path, (err) => {
            if (err){
                this.logError('Unable to unlink file. Path: ' + path + ', error: ' + err);
            }
            cb(err);
        });
    }

    private respond(cb: (response: IRemoveFileResponse) => void, err) {
        var response: IRemoveFileResponse = {error: err};
        cb(response);
    }
}

export interface IRemoveFileRequest extends IRequest{
    filePath: string;
}

export interface IRemoveFileResponse extends IResponse {

}