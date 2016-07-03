/// <reference path="../typings/refs.d.ts" />
import iexpress = require('express');
import controller = require('./base/controller');
import uploadPlayerPictureOp = require('../operation/game/uploadPlayerPictureOperation');
import getPlayerInfoOp = require('../operation/game/getPlayerInfoOperation');
import changePlayerStatusOp = require('../operation/game/changePlayerStatusOperation');
import getGameFightOp = require('../operation/game/getGameFightOperation');
import getGameFightsOp = require('../operation/game/getGameFightsOperation');
import chooseGameWinnerOp = require('../operation/game/chooseGameWinnerOperation');
import getGameLeadersOp = require('../operation/game/getGameLeadersOperation');
import updateFightOp = require('../operation/game/updateFightOperation');
import getPlayerEnergyOp = require('../operation/game/getPlayerEnergyOperation');
import openGiftOp = require('../operation/game/openGiftOperation');

export class GameController extends controller.Controller {
    public getConfig(): IControllerConfig {
        return {
            name: 'game',
            actions: [
                {
                    name: 'getPlayerInfo',
                    func: this.getPlayerInfo,
                    method: HttpMethod.get,
                    roles: []
                },
                {
                    name: 'getGameFight',
                    func: this.getGameFight,
                    method: HttpMethod.get,
                    roles: []
                },
                {
                    name: 'chooseGameWinner',
                    func: this.chooseGameWinner,
                    method: HttpMethod.post,
                    roles: []
                },
                {
                    name: 'getGameLeaders',
                    func: this.getGameLeaders,
                    method: HttpMethod.get,
                    roles: []
                },
                {
                    name: 'getGameFights',
                    func: this.getGameFights,
                    method: HttpMethod.get,
                    roles: [Role.Authenticated]
                },
                {
                    name: 'uploadPlayerPicture',
                    func: this.uploadPlayerPicture,
                    method: HttpMethod.post,
                    roles: [Role.Authenticated]
                },
                {
                    name: 'changePlayerStatus',
                    func: this.changePlayerStatus,
                    method: HttpMethod.post,
                    roles: [Role.Authenticated]
                },
                {
                    name: 'updateFight',
                    func: this.updateFight,
                    method: HttpMethod.post,
                    roles: [Role.Authenticated]
                },
                {
                    name: 'getPlayerEnergy',
                    func: this.getPlayerEnergy,
                    method: HttpMethod.get,
                    roles: [Role.Authenticated]
                },
                {
                    name: 'openGift',
                    func: this.openGift,
                    method: HttpMethod.post,
                    roles: [Role.Authenticated]
                }
            ]
        }
    }

    private uploadPlayerPicture = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        new uploadPlayerPictureOp.UploadPlayerPictureOperation(null, req, res).execute((response) => {
            res.send(response);
        });
    };

    private getPlayerInfo = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        new getPlayerInfoOp.GetPlayerInfoOperation(null, req, res).execute((response) => {
            res.send(response);
        });
    };

    private changePlayerStatus = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        new changePlayerStatusOp.ChangePlayerStatusOperation(null, req, res).execute((response) => {
            res.send(response);
        });
    };

    private getGameFight = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        new getGameFightOp.GetGameFightOperation(null, req, res).execute((response) => {
            res.send(response);
        });
    };

    private chooseGameWinner = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        new chooseGameWinnerOp.ChooseGameWinnerOperation(null, req, res).execute((response) => {
            res.send(response);
        });
    };

    private getGameLeaders = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        new getGameLeadersOp.GetGameLeadersOperation(null, req, res).execute((response) => {
            res.send(response);
        });
    };

    private getGameFights = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        new getGameFightsOp.GetGameFightsOperation(null, req, res).execute((response) => {
            res.send(response);
        });
    };

    private updateFight = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        new updateFightOp.UpdateFightOperation(null, req, res).execute((response) => {
            res.send(response);
        });
    };

    private getPlayerEnergy = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        new getPlayerEnergyOp.GetPlayerEnergyOperation(null, req, res).execute((response) => {
            res.send(response);
        });
    };

    private openGift = (req: iexpress.Request, res: iexpress.Response, next: Function) => {
        new openGiftOp.OpenGiftOperation(null, req, res).execute((response) => {
            res.send(response);
        });
    };
}