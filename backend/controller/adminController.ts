/// <reference path="../typings/refs.d.ts" />
import iexpress = require('express');
import controller = require('./base/controller');
import getConOp = require('../operation/admin/getConnectionsOperation');
import getAccOp = require('../operation/admin/getAccountsOperation');
import getErrOp = require('../operation/admin/getErrorsOperation');
import uploadCoverPictureOp = require('../operation/admin/uploadCoverPictureOperation');
import getFeedbacksOp = require('../operation/admin/getFeedbacksOperation');

export class AdminController extends controller.Controller {
    public getConfig(): IControllerConfig {
        return {
            name: 'admin',
            actions: [
                {
                    name: 'getConnections',
                    func: this.getConnections,
                    method: HttpMethod.get,
                    roles: [Role.Admin]
                },
                {
                    name: 'getErrors',
                    func: this.getErrors,
                    method: HttpMethod.get,
                    roles: [Role.Admin]
                },
                {
                    name: 'getAccounts',
                    func: this.getAccounts,
                    method: HttpMethod.get,
                    roles: [Role.Admin]
                },
                {
                    name: 'uploadCoverPicture',
                    func: this.uploadCoverPicture,
                    method: HttpMethod.post,
                    roles: [Role.Admin]
                },
                {
                    name: 'getFeedbacks',
                    func: this.getFeedbacks,
                    method: HttpMethod.get,
                    roles: [Role.Admin]
                }
            ]
        }
    }

    private getConnections = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        var request: IGetConnectionsRequest = this.getPayload(req);

        new getConOp.GetConnectionsOperation(request).execute((response) => {
            res.send(response);
        });
    };

    private getErrors = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        var request: IGetErrorsRequest = this.getPayload(req);

        new getErrOp.GetErrorsOperation(request).execute((response) => {
            res.send(response);
        });
    };

    private uploadCoverPicture = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        new uploadCoverPictureOp.UploadCoverPictureOperation(null, req, res).execute((response) => {
            res.send(response);
        });
    };

    private getAccounts = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        var request: IGetAccountsRequest = this.getPayload(req);

        new getAccOp.GetAccountsOperation(request).execute((response) => {
            res.send(response);
        });
    };

    private getFeedbacks = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        new getFeedbacksOp.GetFeedbacksOperation(null, req, res).execute((response) => {
            res.send(response);
        });
    };
}