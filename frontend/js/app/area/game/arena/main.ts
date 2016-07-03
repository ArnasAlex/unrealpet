/// <reference path='../../../../typings/refs.d.ts' />
import ko = require('knockout');
import services = require('../../../core/services/services');
import routes = require('../../../routes');
import _ = require('lodash');
import Presenter = require('./presenter');
import Game = require('./game');

class Main {
    presenter = new Presenter(this);
    isVisible = ko.observable(false);
    game = new Game();
    energy = ko.observable(0);
    maxEnergy = ko.observable(0);
    energyPercent: KnockoutComputed<string>;
    energyText: KnockoutComputed<string>;
    gameOverCallback: (played: boolean) => void;

    constructor() {
        this.energyPercent = ko.computed(() => {
            var result = Math.floor(this.energy() / this.maxEnergy() * 100);
            return result + '%'
        });

        this.energyText = ko.computed(() => {
            var result = this.energy() + ' / ' + this.maxEnergy();
            return result;
        });
    }

    activate() {
    }

    deactivate() {
    }

    start = (fightOptions: IGameFightsOptions) => {
        this.game.init(this.presenter);
        this.presenter.init(this.game);
        this.reset();
        this.game.fightId = fightOptions.fightId;
        this.game.energy = fightOptions.energy();
        this.energy(fightOptions.energy());
        this.maxEnergy(fightOptions.maxEnergy);
        this.gameOverCallback = fightOptions.gameOverCallback;
        this.isVisible(true);
        services.ui.toggleBodyScrollBar(false);
        this.game.setPictures(fightOptions.playerPicture(), fightOptions.opponentPicture);
        this.game.start();
    };

    hide = () => {
        this.isVisible(false);
        services.ui.toggleBodyScrollBar(true);
        this.gameOverCallback(this.game.isOver());
    };

    private reset(){
        $('.duel .result').remove();
    }
}

export = Main;