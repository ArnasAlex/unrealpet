/// <reference path='../../../../../typings/refs.d.ts' />
import Skill = require('./base/skill');

class TurnAround extends Skill {
    animate() {
        this.showOriginalResult(() => {
            this.turnScores(this.completeCb);
        })
    }

    turnScores(completeCb) {
        var iconClone = this.cloneSkillIcon();

        var magnifyIcon = (cb) => {
            iconClone.css('z-index', '2');

            iconClone.velocity({
                'font-size': '200px',
                'opacity': '0.5',
                'margin-left': '-90px',
                'margin-top': '-100px',
                'top': '50%',
                'left': '50%'
            }, {duration: 1000, delay: 500, complete: cb});
        };

        var turnAroundScore = (cb) => {
            var opponent = $('.opponent-score');
            var player = $('.player-score');
            var radius = 82;

            var opponentX = parseInt(opponent.css('marginLeft'));
            var opponentY = parseInt(opponent.css('marginTop')) + radius;
            var playerX = parseInt(player.css('marginLeft'));
            var playerY = parseInt(player.css('marginTop')) - radius;

            var opponentDelta = -0.5;
            var playerDelta = 0.5;

            var progress = (elements: JQuery, complete, remaining, start, tweenValue) => {
                var val = (tweenValue + opponentDelta) * Math.PI;
                this.turnAroundElement(opponent, opponentX, opponentY, radius, val);

                val = (tweenValue + playerDelta) * Math.PI;
                this.turnAroundElement(player, playerX, playerY, radius, val);
            };

            opponent.velocity({tween: [1, 0]}, {duration: 3000, progress: progress, complete: cb});
        };

        var removeIcon = (cb) => {
            iconClone.fadeOut({duration: 500, complete: () => {
                iconClone.remove();
                cb();
            }});
        };

        magnifyIcon(() => {
            turnAroundScore(() => {
                removeIcon(() => {
                    completeCb();
                })
            });
        });
    }

    private turnAroundElement = (element: JQuery, startx: number, starty: number, radius: number, val: number) => {
        var newLeft = Math.floor(startx + (radius * Math.cos(val)));
        var newTop = Math.floor(starty + (radius * Math.sin(val)));
        element.css({
            marginLeft: newLeft + 'px',
            marginTop: newTop + 'px'
        });
    };
}

export = TurnAround;