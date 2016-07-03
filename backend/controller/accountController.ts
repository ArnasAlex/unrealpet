/// <reference path="../typings/refs.d.ts" />
import iexpress = require('express');
import controller = require('./base/controller');
import getAccOp = require('../operation/account/getAccountOperation');
import getAccSettingsOp = require('../operation/account/getAccountSettingsOperation');
import saveAccOp = require('../operation/account/saveAccountOperation');
import saveAccSettingsOp = require('../operation/account/saveAccountSettingsOperation');
import uploadAddPicOp = require('../operation/account/uploadAccountPictureOperation');
import removeAccPicOp = require('../operation/account/removeAccountPictureOperation');

export class AccountController extends controller.Controller {
    public getConfig(): IControllerConfig {
        return {
            name: 'account',
            actions: [
                {
                    name: 'getAccount',
                    func: this.getAccount,
                    method: HttpMethod.get,
                    roles: [Role.Authenticated]
                },
                {
                    name: 'getAccountSettings',
                    func: this.getAccountSettings,
                    method: HttpMethod.get,
                    roles: [Role.Authenticated]
                },
                {
                    name: 'saveAccount',
                    func: this.saveAccount,
                    method: HttpMethod.post,
                    roles: [Role.Authenticated]
                },
                {
                    name: 'saveAccountSettings',
                    func: this.saveAccountSettings,
                    method: HttpMethod.post,
                    roles: [Role.Authenticated]
                },
                {
                    name: 'uploadAccountPicture',
                    func: this.uploadAccountPicture,
                    method: HttpMethod.post,
                    roles: [Role.Authenticated]
                },
                {
                    name: 'removeAccountPicture',
                    func: this.removeAccountPicture,
                    method: HttpMethod.post,
                    roles: [Role.Authenticated]
                }
            ]
        }
    }

    private getAccount = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        var request: IGetAccountRequest = this.getPayload(req);

        new getAccOp.GetAccountOperation(request).execute((response) => {
            res.send(response);
        });
    };

    private getAccountSettings = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        var request: IGetAccountSettingsRequest = this.getPayload(req);

        new getAccSettingsOp.GetAccountSettingsOperation(request).execute((response) => {
            res.send(response);
        });
    };

    private saveAccount = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        var request: ISaveAccountRequest = this.getPayload(req);

        new saveAccOp.SaveAccountOperation(request).execute((response) => {
            res.send(response);
        });
    };

    private saveAccountSettings = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        var request: ISaveAccountSettingsRequest = this.getPayload(req);

        new saveAccSettingsOp.SaveAccountSettingsOperation(request).execute((response) => {
            res.send(response);
        });
    };

    private uploadAccountPicture = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        var request: IUploadAccountPictureRequest = {
            expressRequest: req,
            expressResponse: res,
            accountId: req.user.id
        };

        new uploadAddPicOp.UploadAccountPictureOperation(request).execute((response) => {
            res.send(response);
        });
    };

    private removeAccountPicture = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        var request: IRemoveAccountPictureRequest = this.getPayload(req);

        new removeAccPicOp.RemoveAccountPictureOperation(request).execute((response) => {
            res.send(response);
        });
    };
}