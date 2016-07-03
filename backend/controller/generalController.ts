/// <reference path="../typings/refs.d.ts" />
import iexpress = require('express');
import controller = require('./base/controller');
import getMltOp = require('../operation/general/getMltOperation');
import getUserOp = require('../operation/general/getCurrentUserOperation');
import saveFeedbackOp = require('../operation/general/saveFeedbackOperation');

export class GeneralController extends controller.Controller {
    public getConfig(): IControllerConfig {
        return {
            name: 'general',
            actions: [
                {
                    name: 'getmlt',
                    func: this.getMlt,
                    method: HttpMethod.get,
                    roles: []
                },
                {
                    name: 'getCurrentUser',
                    func: this.getCurrentUser,
                    method: HttpMethod.get,
                    roles: []
                },
                {
                    name: 'saveFeedback',
                    func: this.saveFeedback,
                    method: HttpMethod.post,
                    roles: []
                }
            ]
        }
    }

    private getMlt = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        new getMltOp.GetMltOperation(req).execute((response) => {
            res.send(response);
        });
    };

    private getCurrentUser = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        var request: getUserOp.IGetCurrentUserRequest = this.getPayload(req);
        new getUserOp.GetCurrentUserOperation(request).execute((response) =>{
            res.send(response);
        });
    };

    private saveFeedback = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        new saveFeedbackOp.SaveFeedbackOperation(null, req, res).execute((response) =>{
            res.send(response);
        });
    };
}