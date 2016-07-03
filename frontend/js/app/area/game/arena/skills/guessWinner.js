var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", './base/skill'], function (require, exports, Skill) {
    var GuessWinner = (function (_super) {
        __extends(GuessWinner, _super);
        function GuessWinner() {
            var _this = this;
            _super.apply(this, arguments);
            this.guessWinner = function (completeCb) {
                var iconClone = _this.cloneSkillIcon();
                var guessedSelf = _this.skill.data;
                var el = guessedSelf
                    ? $('.duel .player .player-container .picture')
                    : $('.duel .opponent .player-container .picture');
                var destination = _this.getGoToElementPosition(iconClone, el);
                var animateScore = function () {
                    var score = $('.score.player-score');
                    var playerScore = _this.getScoreString(_this.modifiedScore.player);
                    score
                        .velocity({ 'backgroundColor': '#000000' }, { duration: 1000, delay: 500, complete: function () {
                            score.text(playerScore);
                        } })
                        .velocity('reverse', { complete: completeCb });
                };
                iconClone
                    .velocity({
                    top: destination.top + 'px',
                    left: destination.left + 'px'
                }, { duration: 1500 })
                    .velocity('fadeOut', { duration: 700, complete: function () {
                        iconClone.remove();
                        animateScore();
                    } });
            };
        }
        GuessWinner.prototype.animate = function () {
            var _this = this;
            this.showOriginalResult(function () {
                _this.guessWinner(_this.completeCb);
            });
        };
        GuessWinner.prototype.beforeAction = function (cb) {
            var _this = this;
            var html = "<div class=\"guess-winner-container\">" +
                "<div>" +
                ("<button class=\"btn btn-primary\" data-guess=\"me\">" + window.mltId.game_guess_i_won + "</button>") +
                "</div>" +
                "<div>" +
                ("<button class=\"btn btn-primary\">" + window.mltId.game_guess_opponent_won + "</button>") +
                "</div>" +
                "</div>";
            var arena = $('.duel .arena');
            $(html).appendTo(arena);
            var container = $('.guess-winner-container');
            container.velocity('fadeIn');
            var cancel = true;
            container.find('button').click(function (evt) {
                var btn = window.getTarget(evt);
                var value = btn.data('guess') === 'me';
                _this.skill.data = value;
                cancel = false;
            });
            $(window).one('click', function (evt) {
                container.velocity('fadeOut', { complete: function () {
                        container.remove();
                        cb(cancel);
                    } });
            });
        };
        return GuessWinner;
    })(Skill);
    return GuessWinner;
});
//# sourceMappingURL=guessWinner.js.map