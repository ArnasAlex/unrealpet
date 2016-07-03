/// <reference path='../../../../../typings/refs.d.ts' />
import Skill = require('./base/skill');

class Bomb extends Skill {
    animate() {
        this.showOriginalResult(() => {
            this.animateBomb(this.completeCb);
        })
    }

    private animateBomb = (completeCb) => {
        var iconClone = this.cloneSkillIcon();
        var bombDestinationTop = this.getGoToElementPosition(iconClone, this.opponentPic).top;

        var bombColor = this.getBombColorByDamage(damage);
        var damage = this.originalScore.opponent - this.modifiedScore.opponent;
        iconClone
            .velocity({top: bombDestinationTop + 'px'}, {duration: 1000})
            .velocity({
                color: bombColor,
                'font-size': '100px',
                'margin-left': '-=25px',
                'margin-top': '-=35px'
            }, {duration: 1000, complete: () => {
                this.showDamageOnOpponent(damage);
            }})
            .velocity('fadeOut', {duration: 1000, complete: () => {
                iconClone.remove();

                setTimeout(() => {
                    this.animateScoreChange(completeCb);
                }, 1000);
            }});
    };

    private animateScoreChange = (completeCb) => {
        var score = $('.score.opponent-score');

        var opponentScore = this.getScoreString(this.modifiedScore.opponent);
        score
            .velocity({'backgroundColor': '#000000'}, {complete: () => { score.text(opponentScore); }})
            .velocity({'backgroundColor': '#d9534f'}, {complete: completeCb});
    };

    private getBombColorByDamage(dmg: number){
        if (dmg <= 5){
            return '#ffff00'
        }
        if (dmg <= 7){
            return '#ffa500'
        }
        return '#ff0000';
    }
}

export = Bomb;