var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", './base/skill'], function (require, exports, Skill) {
    var DoublePoints = (function (_super) {
        __extends(DoublePoints, _super);
        function DoublePoints() {
            var _this = this;
            _super.apply(this, arguments);
            this.doublePoints = function (completeCb) {
                var skillIcon = _this.getSkillIcon();
                var iconCloneOpponent = _this.cloneElement(skillIcon, false);
                var iconClonePlayer = _this.cloneElement(skillIcon, false);
                var arena = $('.arena');
                iconCloneOpponent.appendTo(arena);
                iconClonePlayer.appendTo(arena);
                var skillIconPosition = _this.getGoToElementPosition(iconCloneOpponent, skillIcon);
                var initialStyles = {
                    'z-index': 999,
                    top: skillIconPosition.top,
                    left: skillIconPosition.left
                };
                iconCloneOpponent.css(initialStyles);
                iconClonePlayer.css(initialStyles);
                var playerScoreEl = $('.score.player-score');
                var opponentScoreEl = $('.score.opponent-score');
                var opponentDestination = _this.getGoToElementPosition(iconCloneOpponent, opponentScoreEl);
                var playerDestination = _this.getGoToElementPosition(iconClonePlayer, playerScoreEl);
                var animateScore = function () {
                    var score = $('.score');
                    var playerScore = _this.getScoreString(_this.modifiedScore.player);
                    var opponentScore = _this.getScoreString(_this.modifiedScore.opponent);
                    score
                        .velocity({ 'backgroundColor': '#000000' }, { duration: 1000, delay: 500, complete: function () {
                            playerScoreEl.text(playerScore);
                            opponentScoreEl.text(opponentScore);
                        } })
                        .velocity('reverse', { complete: completeCb });
                };
                iconCloneOpponent
                    .velocity({ top: opponentDestination.top, left: opponentDestination.left, color: '#000000' }, { duration: 1500 })
                    .velocity('fadeOut', { complete: function () { iconCloneOpponent.remove(); } });
                iconClonePlayer
                    .velocity({ top: playerDestination.top, left: playerDestination.left, color: '#000000' }, { duration: 1500 })
                    .velocity('fadeOut', { complete: function () {
                        iconClonePlayer.remove();
                        animateScore();
                    } });
            };
        }
        DoublePoints.prototype.animate = function () {
            var _this = this;
            this.showOriginalResult(function () {
                _this.doublePoints(_this.completeCb);
            });
        };
        return DoublePoints;
    })(Skill);
    return DoublePoints;
});
//# sourceMappingURL=doublePoints.js.map