/// <reference path='../../../../../../typings/refs.d.ts' />
import Helper = require('../../helper');
import services = require('../../../../../core/services/services');

class Skill {
    completeCb: () => void;
    originalScore: IFightPoints;
    modifiedScore: IFightPoints;
    $skill: JQuery;
    skill: ISkillData;
    opponentPic: JQuery;

    init(completeCb, originalScore: IFightPoints, modifiedScore: IFightPoints, $skill: JQuery, skill: ISkillData){
        this.completeCb = completeCb;
        this.originalScore = originalScore;
        this.modifiedScore = modifiedScore;
        this.$skill = $skill;
        this.opponentPic = $('.duel .opponent .player-container .picture');
        this.skill = skill;
    }

    animate(){
        throw Error('Override animate function in skill class.');
    }

    showOriginalResult = (cb: () => void) => {
        var arena = $('.duel .arena');
        var resultContainer = $('<div class="result"></div>').appendTo(arena);
        var opponentScore = this.getScoreString(this.originalScore.opponent);
        var playerScore = this.getScoreString(this.originalScore.player);
        var opponent = $('<div class="score opponent-score">' + opponentScore + '</div>').appendTo(resultContainer);
        var player = $('<div class="score player-score">' + playerScore + '</div>').appendTo(resultContainer);

        opponent.addClass(this.getScoreClass(this.originalScore.opponent));
        player.addClass(this.getScoreClass(this.originalScore.player));

        $('.result .score').velocity('fadeIn', {complete: cb, delay: 500});
    };

    cloneSkillIcon(){
        var skillIcon = this.getSkillIcon();
        var iconClone = this.cloneElement(skillIcon);
        return iconClone;
    }

    getScoreString(score: number){
        return Helper.getScoreString(score);
    }

    getGoToElementPosition = ($el, $destination) => {
        var elPosition = $el.offset();
        var elWidth = $el.outerWidth();
        var elHeight = $el.outerHeight();

        var destinationPosition = $destination.offset();
        var destinationWidth = $destination.outerWidth();
        var destinationHeight = $destination.outerHeight();

        var widthDiff = destinationWidth - elWidth;
        var halfWidthDiff = Math.floor(widthDiff /2);

        var heightDiff = destinationHeight - elHeight;
        var halfHeightDiff = Math.floor(heightDiff /2);

        var top = Helper.getPositionDifference(destinationPosition.top, elPosition.top, halfHeightDiff);
        var left = Helper.getPositionDifference(destinationPosition.left, elPosition.left, halfWidthDiff);

        return {
            top: top,
            left: left
        }
    };

    getSkillIcon(){
        return this.$skill.find('i');
    }

    getArena(){
        return $('.arena');
    }

    cloneElement(el: JQuery, appendToParent = true){
        return services.ui.cloneElement(el, appendToParent);
    }

    beforeAction(cb: (cancel: boolean) => void){
        cb(false);
    }

    showDamageOnOpponent(damage: number){
        var $el = $('<i class="damage-points"></i>');
        $el.appendTo(this.getArena());

        var text = this.getScoreString(-damage);
        $el.text(text);

        var coordinates = this.opponentPic.offset();
        coordinates.top += this.opponentPic.outerHeight() - $el.outerHeight();
        coordinates.left += this.opponentPic.outerWidth() - $el.outerWidth();
        $el.offset(coordinates);

        setTimeout(() => {
            $el.remove();
        }, 3000);
    }

    private getScoreClass(score: number) {
        if (score < 0){
            return 'minus';
        }
        if (score > 0){
            return 'plus'
        }
        return 'zero';
    }
}

export = Skill;