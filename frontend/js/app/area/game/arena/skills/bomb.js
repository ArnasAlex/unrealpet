var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", './base/skill'], function (require, exports, Skill) {
    var Bomb = (function (_super) {
        __extends(Bomb, _super);
        function Bomb() {
            var _this = this;
            _super.apply(this, arguments);
            this.animateBomb = function (completeCb) {
                var iconClone = _this.cloneSkillIcon();
                var bombDestinationTop = _this.getGoToElementPosition(iconClone, _this.opponentPic).top;
                var bombColor = _this.getBombColorByDamage(damage);
                var damage = _this.originalScore.opponent - _this.modifiedScore.opponent;
                iconClone
                    .velocity({ top: bombDestinationTop + 'px' }, { duration: 1000 })
                    .velocity({
                    color: bombColor,
                    'font-size': '100px',
                    'margin-left': '-=25px',
                    'margin-top': '-=35px'
                }, { duration: 1000, complete: function () {
                        _this.showDamageOnOpponent(damage);
                    } })
                    .velocity('fadeOut', { duration: 1000, complete: function () {
                        iconClone.remove();
                        setTimeout(function () {
                            _this.animateScoreChange(completeCb);
                        }, 1000);
                    } });
            };
            this.animateScoreChange = function (completeCb) {
                var score = $('.score.opponent-score');
                var opponentScore = _this.getScoreString(_this.modifiedScore.opponent);
                score
                    .velocity({ 'backgroundColor': '#000000' }, { complete: function () { score.text(opponentScore); } })
                    .velocity({ 'backgroundColor': '#d9534f' }, { complete: completeCb });
            };
        }
        Bomb.prototype.animate = function () {
            var _this = this;
            this.showOriginalResult(function () {
                _this.animateBomb(_this.completeCb);
            });
        };
        Bomb.prototype.getBombColorByDamage = function (dmg) {
            if (dmg <= 5) {
                return '#ffff00';
            }
            if (dmg <= 7) {
                return '#ffa500';
            }
            return '#ff0000';
        };
        return Bomb;
    })(Skill);
    return Bomb;
});
//# sourceMappingURL=bomb.js.map