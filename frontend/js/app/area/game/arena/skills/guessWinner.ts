/// <reference path='../../../../../typings/refs.d.ts' />
import Skill = require('./base/skill');

class GuessWinner extends Skill {
    animate() {
        this.showOriginalResult(() => {
            this.guessWinner(this.completeCb);
        })
    }

    beforeAction(cb: (cancel: boolean) => void){
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

        var cancel = true;
        container.find('button').click((evt) => {
            var btn = window.getTarget(evt);
            var value = btn.data('guess') === 'me';
            this.skill.data = value;
            cancel = false;
        });

        $(window).one('click', (evt) => {
            container.velocity('fadeOut', {complete: () => {
                container.remove();
                cb(cancel);
            }});
        });
    }

    private guessWinner = (completeCb) => {
        var iconClone = this.cloneSkillIcon();

        var guessedSelf = this.skill.data;
        var el = guessedSelf
            ? $('.duel .player .player-container .picture')
            : $('.duel .opponent .player-container .picture');

        var destination = this.getGoToElementPosition(iconClone, el);

        var animateScore = () => {
            var score = $('.score.player-score');
            var playerScore = this.getScoreString(this.modifiedScore.player);

            score
                .velocity({'backgroundColor': '#000000'}, {duration: 1000, delay: 500, complete: () => {
                    score.text(playerScore);
                }})
                .velocity('reverse', {complete: completeCb});
        };

        iconClone
            .velocity({
                top: destination.top + 'px',
                left: destination.left + 'px'
            }, {duration: 1500})
            .velocity('fadeOut', {duration: 700, complete: () => {
                iconClone.remove();
                animateScore();
            }});
    };
}

export = GuessWinner;