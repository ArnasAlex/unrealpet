/// <reference path='../../../../typings/refs.d.ts' />
define(["require", "exports", 'lodash', '../../../core/services/services', '../../../routes'], function (require, exports, _, services, routes) {
    var Game = (function () {
        function Game() {
            this.skills = [];
        }
        Game.prototype.init = function (presenter) {
            this.presenter = presenter;
        };
        Game.prototype.start = function () {
            var _this = this;
            this.fillSkills();
            _.each(this.skills, function (x) { return _this.presenter.addSkill(x); });
            this.presenter.setPictures();
            this.isGameOver = false;
        };
        Game.prototype.setPictures = function (player, opponent) {
            this.playerPicture = player;
            this.opponentPicture = opponent;
        };
        Game.prototype.over = function () {
            this.isGameOver = true;
        };
        Game.prototype.isOver = function () {
            return this.isGameOver;
        };
        Game.prototype.getSkill = function (id) {
            var skill = _.find(this.skills, function (x) { return x.id == id; });
            if (!skill) {
                throw Error('Skill not found by id: ' + id);
            }
            return skill;
        };
        Game.prototype.skillUsed = function (skill) {
            this.over();
            this.updateFight(skill);
        };
        Game.prototype.isEnoughEnergyForSkill = function (skill) {
            return this.energy >= skill.energy;
        };
        Game.prototype.updateFight = function (skill) {
            var _this = this;
            var req = {
                id: this.fightId,
                skill: skill.content,
                guessingSelf: skill.data
            };
            services.server.post(routes.game.updateFight, req).then(function (response) {
                _this.animateSkill(response, skill);
            });
        };
        Game.prototype.animateSkill = function (response, skill) {
            var _this = this;
            this.presenter.moveSkillToLogo(skill, response.originalPoints, response.modifiedPoints, function () {
                _this.presenter.showEndingMenu(response.isWinner, response.modifiedPoints.player);
            });
        };
        Game.prototype.fillSkills = function () {
            this.skills = [];
            var turnAround = {};
            turnAround.id = 1;
            turnAround.content = 0;
            turnAround.icon = 'fa-refresh';
            turnAround.energy = 2;
            turnAround.name = window.mltId.fight_ending_skill_turn_around_name;
            turnAround.description = window.mltId.fight_ending_skill_turn_around_description;
            turnAround.type = 0;
            turnAround.position = 0;
            this.skills.push(turnAround);
            var bomb = {};
            bomb.id = 2;
            bomb.content = 1;
            bomb.icon = 'fa-bomb';
            bomb.energy = 5;
            bomb.name = window.mltId.fight_ending_skill_bomb_name;
            bomb.description = window.mltId.fight_ending_skill_bomb_description;
            bomb.type = 2;
            bomb.position = 1;
            this.skills.push(bomb);
            var guessWinner = {};
            guessWinner.id = 3;
            guessWinner.content = 2;
            guessWinner.icon = 'fa-hand-o-up';
            guessWinner.energy = 1;
            guessWinner.name = window.mltId.fight_ending_skill_guess_winner_name;
            guessWinner.description = window.mltId.fight_ending_skill_guess_winner_description;
            guessWinner.type = 1;
            guessWinner.position = 2;
            this.skills.push(guessWinner);
            var doublePoints = {};
            doublePoints.id = 4;
            doublePoints.content = 3;
            doublePoints.icon = 'fa-angle-double-up';
            doublePoints.energy = 4;
            doublePoints.name = window.mltId.fight_ending_skill_double_points_name;
            doublePoints.description = window.mltId.fight_ending_skill_double_points_description;
            doublePoints.type = 0;
            doublePoints.position = 3;
            this.skills.push(doublePoints);
        };
        return Game;
    })();
    return Game;
});
//# sourceMappingURL=game.js.map