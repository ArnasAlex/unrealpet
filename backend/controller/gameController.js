var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var controller = require('./base/controller');
var uploadPlayerPictureOp = require('../operation/game/uploadPlayerPictureOperation');
var getPlayerInfoOp = require('../operation/game/getPlayerInfoOperation');
var changePlayerStatusOp = require('../operation/game/changePlayerStatusOperation');
var getGameFightOp = require('../operation/game/getGameFightOperation');
var getGameFightsOp = require('../operation/game/getGameFightsOperation');
var chooseGameWinnerOp = require('../operation/game/chooseGameWinnerOperation');
var getGameLeadersOp = require('../operation/game/getGameLeadersOperation');
var updateFightOp = require('../operation/game/updateFightOperation');
var getPlayerEnergyOp = require('../operation/game/getPlayerEnergyOperation');
var openGiftOp = require('../operation/game/openGiftOperation');
var GameController = (function (_super) {
    __extends(GameController, _super);
    function GameController() {
        _super.apply(this, arguments);
        this.uploadPlayerPicture = function (req, res, next) {
            new uploadPlayerPictureOp.UploadPlayerPictureOperation(null, req, res).execute(function (response) {
                res.send(response);
            });
        };
        this.getPlayerInfo = function (req, res, next) {
            new getPlayerInfoOp.GetPlayerInfoOperation(null, req, res).execute(function (response) {
                res.send(response);
            });
        };
        this.changePlayerStatus = function (req, res, next) {
            new changePlayerStatusOp.ChangePlayerStatusOperation(null, req, res).execute(function (response) {
                res.send(response);
            });
        };
        this.getGameFight = function (req, res, next) {
            new getGameFightOp.GetGameFightOperation(null, req, res).execute(function (response) {
                res.send(response);
            });
        };
        this.chooseGameWinner = function (req, res, next) {
            new chooseGameWinnerOp.ChooseGameWinnerOperation(null, req, res).execute(function (response) {
                res.send(response);
            });
        };
        this.getGameLeaders = function (req, res, next) {
            new getGameLeadersOp.GetGameLeadersOperation(null, req, res).execute(function (response) {
                res.send(response);
            });
        };
        this.getGameFights = function (req, res, next) {
            new getGameFightsOp.GetGameFightsOperation(null, req, res).execute(function (response) {
                res.send(response);
            });
        };
        this.updateFight = function (req, res, next) {
            new updateFightOp.UpdateFightOperation(null, req, res).execute(function (response) {
                res.send(response);
            });
        };
        this.getPlayerEnergy = function (req, res, next) {
            new getPlayerEnergyOp.GetPlayerEnergyOperation(null, req, res).execute(function (response) {
                res.send(response);
            });
        };
        this.openGift = function (req, res, next) {
            new openGiftOp.OpenGiftOperation(null, req, res).execute(function (response) {
                res.send(response);
            });
        };
    }
    GameController.prototype.getConfig = function () {
        return {
            name: 'game',
            actions: [
                {
                    name: 'getPlayerInfo',
                    func: this.getPlayerInfo,
                    method: 1,
                    roles: []
                },
                {
                    name: 'getGameFight',
                    func: this.getGameFight,
                    method: 1,
                    roles: []
                },
                {
                    name: 'chooseGameWinner',
                    func: this.chooseGameWinner,
                    method: 2,
                    roles: []
                },
                {
                    name: 'getGameLeaders',
                    func: this.getGameLeaders,
                    method: 1,
                    roles: []
                },
                {
                    name: 'getGameFights',
                    func: this.getGameFights,
                    method: 1,
                    roles: [1]
                },
                {
                    name: 'uploadPlayerPicture',
                    func: this.uploadPlayerPicture,
                    method: 2,
                    roles: [1]
                },
                {
                    name: 'changePlayerStatus',
                    func: this.changePlayerStatus,
                    method: 2,
                    roles: [1]
                },
                {
                    name: 'updateFight',
                    func: this.updateFight,
                    method: 2,
                    roles: [1]
                },
                {
                    name: 'getPlayerEnergy',
                    func: this.getPlayerEnergy,
                    method: 1,
                    roles: [1]
                },
                {
                    name: 'openGift',
                    func: this.openGift,
                    method: 2,
                    roles: [1]
                }
            ]
        };
    };
    return GameController;
})(controller.Controller);
exports.GameController = GameController;
//# sourceMappingURL=gameController.js.map