/// <reference path='../../../../typings/refs.d.ts' />

import _ = require('lodash');
import Presenter = require('./presenter');
import services = require('../../../core/services/services');
import routes = require('../../../routes');

class Game {
    energy: number;
    playerPicture: string;
    opponentPicture: string;
    fightId: string;

    private isGameOver: boolean;
    private skills: ISkillData[] = [];

    private presenter: Presenter;

    constructor(){

    }

    init(presenter: Presenter){
        this.presenter = presenter;
    }

    start(){
        this.fillSkills();
        _.each(this.skills, x => this.presenter.addSkill(x));

        this.presenter.setPictures();
        this.isGameOver = false;
    }

    setPictures(player: string, opponent: string){
        this.playerPicture = player;
        this.opponentPicture = opponent;
    }

    over(){
        this.isGameOver = true;
    }

    isOver(){
        return this.isGameOver;
    }

    getSkill(id: number){
        var skill: ISkillData = _.find(this.skills, x => x.id == id);
        if (!skill){
            throw Error('Skill not found by id: ' + id);
        }

        return skill;
    }

    skillUsed(skill: ISkillData){
        this.over();
        this.updateFight(skill);
    }

    isEnoughEnergyForSkill(skill: ISkillData){
        return this.energy >= skill.energy;
    }

    private updateFight(skill: ISkillData){
        var req: IUpdateFightRequest = {
            id: this.fightId,
            skill: skill.content,
            guessingSelf: skill.data
        };
        services.server.post(routes.game.updateFight, req).then((response) => {
            this.animateSkill(response, skill);
        });

        //this.animateSkill({energy: 5, originalPoints: {player: 2, opponent: -1}, modifiedPoints: {player: 4, opponent: -2}, isWinner: true}, skill);
    }

    private animateSkill(response: IUpdateFightResponse, skill: ISkillData){
        this.presenter.moveSkillToLogo(skill, response.originalPoints, response.modifiedPoints, () => {
            this.presenter.showEndingMenu(response.isWinner, response.modifiedPoints.player);
        });
    }

    private fillSkills() {
        this.skills = [];

        var turnAround: ISkillData = <any>{};
        turnAround.id = 1;
        turnAround.content = VoteResultControlSkill.TurnAround;
        turnAround.icon = 'fa-refresh';
        turnAround.energy = 2;
        turnAround.name = window.mltId.fight_ending_skill_turn_around_name;
        turnAround.description = window.mltId.fight_ending_skill_turn_around_description;
        turnAround.type = SkillType.Neutral;
        turnAround.position = 0;
        this.skills.push(turnAround);

        var bomb: ISkillData = <any>{};
        bomb.id = 2;
        bomb.content = VoteResultControlSkill.Bomb;
        bomb.icon = 'fa-bomb';
        bomb.energy = 5;
        bomb.name = window.mltId.fight_ending_skill_bomb_name;
        bomb.description = window.mltId.fight_ending_skill_bomb_description;
        bomb.type = SkillType.Damage;
        bomb.position = 1;
        this.skills.push(bomb);

        var guessWinner: ISkillData = <any>{};
        guessWinner.id = 3;
        guessWinner.content = VoteResultControlSkill.GuessWinner;
        guessWinner.icon = 'fa-hand-o-up';
        guessWinner.energy = 1;
        guessWinner.name = window.mltId.fight_ending_skill_guess_winner_name;
        guessWinner.description = window.mltId.fight_ending_skill_guess_winner_description;
        guessWinner.type = SkillType.Benefit;
        guessWinner.position = 2;
        this.skills.push(guessWinner);

        var doublePoints: ISkillData = <any>{};
        doublePoints.id = 4;
        doublePoints.content = VoteResultControlSkill.DoublePoints;
        doublePoints.icon = 'fa-angle-double-up';
        doublePoints.energy = 4;
        doublePoints.name = window.mltId.fight_ending_skill_double_points_name;
        doublePoints.description = window.mltId.fight_ending_skill_double_points_description;
        doublePoints.type = SkillType.Neutral;
        doublePoints.position = 3;
        this.skills.push(doublePoints);
    }
}

export = Game;