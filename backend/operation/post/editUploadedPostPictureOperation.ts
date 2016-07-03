/// <reference path="../../typings/refs.d.ts" />
import operation = require('../base/operation');
import cons = require('../../core/constants');
import gm = require('gm');

export class EditUploadedPostPictureOperation extends operation.Operation {
    protected request: IEditPictureRequest;

    public execute(cb: (response: IEditPictureResponse) => void) {
        this.async.waterfall([
                this.edit,
            ],
            this.respond.bind(this, cb));
    }

    private edit = (next) => {
        var picturePath = cons.Constants.getFilePathFromUrl(this.request.url);
        var action = this.getMethodFromAction();
        this.executeOptimization(picturePath, action, next);
    };

    private executeOptimization(picturePath, editMethod: (state: gm.State) => gm.State, next){
        var worker: gm.State = gm(picturePath);
        editMethod(worker);
        worker.write(picturePath, (err) => {
                next(err);
            });
    }

    private getMethodFromAction(){
        var action = this.request.action;
        var result: (state: gm.State) => gm.State;
        switch (action){
            case PictureEditAction.RotateLeft:
                result = (state: gm.State) => {return state.rotate('black', -90);};
                break;

            case PictureEditAction.RotateRight:
                result = (state: gm.State) => {return state.rotate('black', 90);};
                break;
        }

        return result;
    }

    private respond(cb: (response: IEditPictureResponse) => void, err) {
        var response: IEditPictureResponse = {
            error: err
        };

        cb(response);
    }
}