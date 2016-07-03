/// <reference path='../../../../../typings/refs.d.ts' />
import Skill = require('./base/skill');

class DoublePoints extends Skill {
    animate() {
        this.showOriginalResult(() => {
            this.doublePoints(this.completeCb);
        })
    }

    private doublePoints = (completeCb) => {
        var skillIcon = this.getSkillIcon();
        var iconCloneOpponent = this.cloneElement(skillIcon, false);
        var iconClonePlayer = this.cloneElement(skillIcon, false);
        var arena = $('.arena');
        iconCloneOpponent.appendTo(arena);
        iconClonePlayer.appendTo(arena);

        var skillIconPosition = this.getGoToElementPosition(iconCloneOpponent, skillIcon);
        var initialStyles = {
            'z-index': 999,
            top: skillIconPosition.top,
            left: skillIconPosition. left
        };

        iconCloneOpponent.css(initialStyles);
        iconClonePlayer.css(initialStyles);

        var playerScoreEl = $('.score.player-score');
        var opponentScoreEl = $('.score.opponent-score');

        var opponentDestination = this.getGoToElementPosition(iconCloneOpponent, opponentScoreEl);
        var playerDestination = this.getGoToElementPosition(iconClonePlayer, playerScoreEl);

        var animateScore = () => {
            var score = $('.score');
            var playerScore = this.getScoreString(this.modifiedScore.player);
            var opponentScore = this.getScoreString(this.modifiedScore.opponent);

            score
                .velocity({'backgroundColor': '#000000'}, {duration: 1000, delay: 500, complete: () => {
                    playerScoreEl.text(playerScore);
                    opponentScoreEl.text(opponentScore);
                }})
                .velocity('reverse', {complete: completeCb});
        };

        iconCloneOpponent
            .velocity({top: opponentDestination.top, left: opponentDestination.left, color: '#000000'}, {duration: 1500})
            .velocity('fadeOut', {complete: () => { iconCloneOpponent.remove(); }});

        iconClonePlayer
            .velocity({top: playerDestination.top, left: playerDestination. left, color: '#000000'}, {duration: 1500})
            .velocity('fadeOut', {complete: () => {
                iconClonePlayer.remove();
                animateScore();
            }});

    };
}

export = DoublePoints;