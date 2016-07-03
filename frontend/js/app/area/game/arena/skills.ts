/// <reference path='../../../../typings/refs.d.ts' />
import _ = require('lodash');
import Game = require('./game');
import services = require('../../../core/services/services');
import Presenter = require('./presenter');
import TurnAround = require('./skills/turnAround');
import GuessWinner = require('./skills/guessWinner');
import Bomb = require('./skills/bomb');
import DoublePoints = require('./skills/doublePoints');
import Skill = require('./skills/base/skill');

class Skills {
    private container: JQuery;
    private skillSelector = '.skill';
    private game: Game;
    private presenter: Presenter;
    private skillStartCoordinates: JQueryCoordinates;

    constructor(){

    }

    init(arena: JQuery, game: Game, presenter: Presenter){
        this.game = game;
        this.presenter = presenter;
        this.container = arena.find('.skills');
        this.bind();
    }

    add(skill: ISkillData){
        var $skill = this.createSkillElement(skill);

        $skill.appendTo(this.container);
        this.bindSkillEvents($skill);
    }

    getSkillElement(id: number): JQuery{
        var skills = this.container.find(this.skillSelector);
        var skill =_.find(skills, x => $(x).data('id') == id);

        return $(skill);
    }

    updateSkillStatus(status: SkillStatus, skill: ISkillData, $el: JQuery){
        skill.status = status;
        this.refreshSkillClasses(skill, $el);
    }

    animate(skill: ISkillData, originalScore, modifiedScore, cb){
        var animation: Skill = this.getSkillAnimation(skill);
        var $skill = this.getSkillElement(skill.id);

        animation.init(cb, originalScore, modifiedScore, $skill, skill);
        animation.animate();
    }

    beforeAction(skill: ISkillData, cb){
        var animation: Skill = this.getSkillAnimation(skill);
        var $skill = this.getSkillElement(skill.id);

        animation.init(cb, null, null, $skill, skill);
        animation.beforeAction(cb);
    }

    private getSkillAnimation(skill: ISkillData): Skill{
        var animations = [];
        animations[VoteResultControlSkill.TurnAround] = TurnAround;
        animations[VoteResultControlSkill.Bomb] = Bomb;
        animations[VoteResultControlSkill.DoublePoints] = DoublePoints;
        animations[VoteResultControlSkill.GuessWinner] = GuessWinner;

        var animation = animations[skill.content];
        if (!animation){
            throw Error('Animation not found for skill id: ' + skill.id);
        }
        return new animation();
    }

    private createSkillElement(skill: ISkillData){
        var template = this.getTemplate();
        var $skill = $(template);

        $skill.data('id', skill.id);
        $skill.find('span').text(skill.energy);
        $skill.find('i').addClass(skill.icon);
        $skill.addClass(this.getClasses(skill));

        var descriptionOptions = this.getDescriptionOptions(skill);
        $skill.popover(descriptionOptions);

        return $skill;
    }

    private getClasses(skill: ISkillData){
        var classes = [
            'skill',
            this.getPositionClass(skill.position),
            this.getSkillTypeClass(skill.type),
            this.getClassByStatus(skill.status)
        ];
        return classes.join(' ');
    }

    private getPositionClass(position: number){
        return 'skill-' + position;
    }

    private getSkillTypeClass(type: SkillType){
        var types = [];
        types[SkillType.Neutral] = 'neutral';
        types[SkillType.Benefit] = 'benefit';
        types[SkillType.Damage] = 'damage';

        return types[type];
    }

    private getTemplate(){
        return `<div>
                    <i class="fa skill-icon"></i>
                    <span class="badge energy"></span>
                </div>`;
    }

    private getSkillDescriptionTemplate() {
        return '<div class="popover skill-description" role="tooltip">' +
            '<div class="arrow"></div>' +
            '<h3 class="popover-title"></h3>' +
            '<div class="popover-content"></div>' +
            '</div>';
    }

    private getSkillDescriptionContent(skill: ISkillData) {
        return `<div class="pull-right"><span class="badge energy">${skill.energy}</span></div>
            <div class="text-center title">${skill.name}</div>
            <div class="clearfix"></div>
            <div class="text-center picture"><i class="fa ${skill.icon}"></i></div>
            <div class="explanation">${skill.description}</div>`;
    }

    private getDescriptionOptions = (skill: ISkillData) =>{
        return {
            content: this.getSkillDescriptionContent(skill),
            html: true,
            placement: 'top',
            template: this.getSkillDescriptionTemplate(),
            trigger: 'manual'
        };
    };

    private getClassByStatus(status: SkillStatus) {
        var classes = [];
        classes[SkillStatus.Initialized] = '';
        classes[SkillStatus.Initial] = '';
        classes[SkillStatus.Active] = 'active';
        classes[SkillStatus.Valid] = 'valid';
        classes[SkillStatus.Used] = '';
        classes[SkillStatus.InCenter] = '';

        return classes[status];
    }

    private getSkillById(id: number){
        var skill = this.game.getSkill(id);
        return skill;
    }

    private getSkillFromElement($el: JQuery){
        var skillId = parseInt($el.data('id'));
        var skill = this.getSkillById(skillId);

        return skill;
    }

    private refreshSkillClasses(skill: ISkillData, $el: JQuery){
        $el.removeClass();

        var classes = this.getClasses(skill);
        $el.addClass(classes);
    }

    private bind(){
        this.container.on('mousedown', this.skillSelector, this.onMouseDown);
    }

    private onMouseDown = (evt) => {
        var target = window.getTarget(evt);
        if (!target.hasClass('skill')){
            target = target.closest('.skill');
        }

        var skill = this.getSkillFromElement(target);
        this.updateSkillStatus(SkillStatus.Active, skill, target);

        target.popover('show');

        $('body').one('mouseup', (evt) => {
            this.onMouseUp(target);
        });
    };

    private onMouseUp = (target: JQuery) => {
        if (!target.hasClass('skill')){
            target = target.closest('.skill');
        }

        var skill = this.getSkillFromElement(target);

        if (skill.status !== SkillStatus.Valid){
            this.updateSkillStatus(SkillStatus.Initial, skill, target);
        }

        target.popover('hide');
        this.presenter.toggleLogoActivation(false);
    };

    private bindSkillEvents($skill: JQuery){
        var self = this;

        $skill.draggable({
            distance: 20,
            drag: (evt, ui) => {
                var target = window.getTarget(evt);
                var canBeDropped = this.skillStartCoordinates.top - 100 > ui.position.top;

                var skill = this.getSkillFromElement(target);
                var status = SkillStatus.Active;
                if (canBeDropped){
                    status = SkillStatus.Valid;
                }

                this.updateSkillStatus(status, skill, target);
                this.presenter.toggleLogoActivation(canBeDropped);
            },
            start: (evt, ui) => {
                this.skillStartCoordinates = ui.helper.position();
                var target = window.getTarget(evt);
                var skill = this.getSkillFromElement(target);

                target.popover('hide');
                if(!this.canBeDragged(skill)){
                    skill.status = SkillStatus.Initial;
                    return false;
                }
                if(!this.game.isEnoughEnergyForSkill(skill)){
                    this.presenter.showNotEnoughEnergy();
                    return false;
                }
            },
            revert: function() {
                var target = $(this);
                var skill = self.getSkillFromElement(target);

                if (skill.status !== SkillStatus.Valid){
                    skill.status = SkillStatus.Initialized;
                    return true;
                }

                self.useSkill(skill);
            }
        });
    }

    revertSkill(skill: ISkillData){
        var $skill = this.getSkillElement(skill.id);
        $skill.velocity({top: this.skillStartCoordinates.top, left: this.skillStartCoordinates.left}, {complete: () => {
            var skill = this.getSkillFromElement($skill);
            this.updateSkillStatus(SkillStatus.Initialized, skill, $skill);
        }});
    }

    reset(){
        this.container.find(this.skillSelector).remove();
    }

    private useSkill = (skill: ISkillData) => {
        this.beforeAction(skill, (cancel: boolean) => {
            if (cancel){
                this.revertSkill(skill);
            }
            else{
                this.game.skillUsed(skill);
            }
        });
    };

    private showGuessWinner = (skill: ISkillData, selectedCb) => {
        var html = `<div class="guess-winner-container">` +
            `<div>` +
            `<button class="btn btn-primary" data-guess="me">${window.mltId.game_guess_i_won}</button>` +
            `</div>` +
            `<div>` +
            `<button class="btn btn-primary">${window.mltId.game_guess_opponent_won}</button>` +
            `</div>` +
            `</div>`;

        var arena = $('.duel .arena');
        $(html).appendTo(arena);
        var container = $('.guess-winner-container');
        container.velocity('fadeIn');

        container.find('button').click((evt) => {
            var btn = window.getTarget(evt);
            var value = btn.data('guess') === 'me';
            skill.data = value;
        });

        $(window).one('click', (evt) => {
            container.velocity('fadeOut', {complete: () => {
                container.remove();
                selectedCb();
            }});
        });
    };

    private canBeDragged = (skill: ISkillData) => {
        var result = !this.game.isOver() && skill.status !== SkillStatus.Used;
        return result;
    };
}

export = Skills;