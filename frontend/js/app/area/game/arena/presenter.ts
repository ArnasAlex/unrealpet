/// <reference path='../../../../typings/refs.d.ts' />
import Main = require('./main');
import Helper = require('./helper');
import Menu = require('./menu');
import Skills = require('./skills');
import Game = require('./game');
import services = require('../../../core/services/services');

class Presenter {
    private elements = new Elements();
    private main: Main;
    private game: Game;

    constructor(main: Main) {
        this.main = main;
    }

    init(game: Game) {
        this.game = game;
        this.elements.init(game, this);
        this.reset();
        this.bind();
    }

    addSkill(skill: ISkillData){
        this.elements.skills.add(skill);
    }

    setPictures(){
        Helper.setBackgroundPicture(this.elements.playerPicture, this.game.playerPicture);
        Helper.setBackgroundPicture(this.elements.opponentPicture, this.game.opponentPicture);
    }

    showEndingMenu = (isWin: boolean, points: number) =>{
        this.elements.menu.show(isWin, points, this.game.playerPicture);
    };

    moveSkillToLogo = (skill: ISkillData, originalScore: IFightPoints, modifiedScore: IFightPoints, cb) => {
        var logo = this.elements.logo;
        var logoPosition = logo.offset();
        var logoSize = logo.outerWidth();
        var $skill = this.elements.skills.getSkillElement(skill.id);
        this.elements.skills.updateSkillStatus(SkillStatus.Used, skill, $skill);

        var skillPosition = $skill.offset();
        var skillSize = $skill.outerWidth();
        var sizeDiff = logoSize - skillSize;
        var halfSizeDiff = Math.floor(sizeDiff /2);

        $skill.velocity({
            top: Helper.getPositionDifference(logoPosition.top, skillPosition.top, halfSizeDiff),
            left: Helper.getPositionDifference(logoPosition.left, skillPosition.left, halfSizeDiff)
        }, {complete: () => {
            this.elements.skills.updateSkillStatus(SkillStatus.InCenter, skill, $skill);
            this.elements.skills.animate(skill, originalScore, modifiedScore, cb);
        }});
    };

    revertSkill = (skill: ISkillData) => {
        this.elements.skills.revertSkill(skill);
    };

    toggleLogoActivation = (active: boolean) => {
        this.elements.logo.toggleClass('active', active);
    };

    showNotEnoughEnergy = () => {
        services.ui.showAlert({
            msg: window.mltId.game_not_enough_energy,
            type: AlertType.Warning,
            icon: 'fa-bolt'
        });
    };

    private reset() {
        this.elements.menu.container.hide();
        this.elements.menu.content.hide();
        this.elements.menu.overlay.hide();
        this.elements.skills.reset();
    }

    private bind(){
        this.elements.menu.button.click(() => {
            this.main.hide();
        });
    }
}

export = Presenter;

class Elements {
    arena: JQuery;
    opponentPicture: JQuery;
    playerPicture: JQuery;
    logo: JQuery;
    menu = new Menu();
    skills = new Skills();

    init(game: Game, presenter: Presenter) {
        this.arena = $('.duel .arena');
        this.opponentPicture = this.arena.find('.opponent .picture');
        this.playerPicture = this.arena.find('.player .picture');
        this.logo = this.arena.find('.logo');

        this.menu.init(this.arena);
        this.skills.init(this.arena, game, presenter);
    }
}