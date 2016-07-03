/// <reference path='../../../typings/refs.d.ts' />
import ko = require('knockout');
import services = require('../../core/services/services');
import routes = require('../../routes');
import _ = require('lodash');
import VoteResultControl = require('./arena/main');

class GameFights {
    list = ko.observableArray([]);
    totalCount = 0;
    hasMore = ko.observable(true);
    pageSize = 12;
    voteResultControl = new VoteResultControl();

    private options: IGameFightsOptions;
    constructor() {
        this.init();
    }

    activate(options: IGameFightsOptions) {
        this.options = options;
    }

    deactivate(){
    }

    refresh = () => {
        this.list([]);
        this.get();
    };

    get(){
        var request: IGetGameFightsRequest = {
            skip: this.list().length,
            take: this.pageSize
        };

        services.server.get(routes.game.getGameFights, request).then(this.getCb);
    }

    moreClick = () => {
        this.get();
    };

    fightClick = (fight: Fight, evt) => {
        if (fight.status !== FightStatus.Initial){
            return;
        }

        var refresh = (played) => {
            if (!played){
                return;
            }
            this.refresh();
            this.options.gameOverCallback(played);
        };

        var startOptions: IGameFightsOptions = {
            energy: this.options.energy,
            maxEnergy: this.options.maxEnergy,
            fightId: fight.id,
            gameOverCallback: refresh,
            playerPicture: this.options.playerPicture,
            opponentPicture: fight.opponentPicture
        };

        this.voteResultControl.start(startOptions);
    };

    private init() {
        this.get();
    }

    private getCb = (response: IGetGameFightsResponse) => {
        if (response.totalCount){
            this.totalCount = response.totalCount;
        }

        var retrievedList = _.map(response.list, x => new Fight(x));
        var list = this.list();
        var result = list.concat(retrievedList);
        this.list(result);

        var hasMore = result.length < this.totalCount;
        this.hasMore(hasMore);
    }
}

export = GameFights;

class Fight implements IGameFight {
    id: string;
    opponentPlayerId: string;
    opponentAccountId: string;
    opponentName: string;
    opponentPicture: string;
    opponentPlace: number;
    isWin =  false;
    points = 0;
    date: string;
    status: FightStatus;

    resultText: string;
    pointsText = '';
    timeAgo: string;
    showResult = false;
    isLocked = false;
    isUnopened = false;

    constructor(dto: IGameFight){
        _.assign(this, dto);

        this.resultText = dto.isWin
            ? window.mltId.game_fight_won
            : window.mltId.game_fight_lost;

        if (dto.points !== undefined){
            this.pointsText = dto.points > 0
                ? '+' + dto.points
                : dto.points.toString();
        }

        this.timeAgo = services.util.getTimeAgo(dto.date);

        if (this.status === FightStatus.Initial){
            this.isUnopened = true;
        }
        else if (this.status === FightStatus.Playing){
            this.isLocked = true;
        }
        else {
            this.showResult = true;
        }
    }

    getCss = () => {
        if (this.showResult){
            return this.isWin ? 'win' : 'defeat';
        }

        if (this.isLocked) {
            return 'locked';
        }

        return 'unopened';
    };
}