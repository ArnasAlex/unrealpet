var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", './base/skill'], function (require, exports, Skill) {
    var TurnAround = (function (_super) {
        __extends(TurnAround, _super);
        function TurnAround() {
            _super.apply(this, arguments);
            this.turnAroundElement = function (element, startx, starty, radius, val) {
                var newLeft = Math.floor(startx + (radius * Math.cos(val)));
                var newTop = Math.floor(starty + (radius * Math.sin(val)));
                element.css({
                    marginLeft: newLeft + 'px',
                    marginTop: newTop + 'px'
                });
            };
        }
        TurnAround.prototype.animate = function () {
            var _this = this;
            this.showOriginalResult(function () {
                _this.turnScores(_this.completeCb);
            });
        };
        TurnAround.prototype.turnScores = function (completeCb) {
            var _this = this;
            var iconClone = this.cloneSkillIcon();
            var magnifyIcon = function (cb) {
                iconClone.css('z-index', '2');
                iconClone.velocity({
                    'font-size': '200px',
                    'opacity': '0.5',
                    'margin-left': '-90px',
                    'margin-top': '-100px',
                    'top': '50%',
                    'left': '50%'
                }, { duration: 1000, delay: 500, complete: cb });
            };
            var turnAroundScore = function (cb) {
                var opponent = $('.opponent-score');
                var player = $('.player-score');
                var radius = 82;
                var opponentX = parseInt(opponent.css('marginLeft'));
                var opponentY = parseInt(opponent.css('marginTop')) + radius;
                var playerX = parseInt(player.css('marginLeft'));
                var playerY = parseInt(player.css('marginTop')) - radius;
                var opponentDelta = -0.5;
                var playerDelta = 0.5;
                var progress = function (elements, complete, remaining, start, tweenValue) {
                    var val = (tweenValue + opponentDelta) * Math.PI;
                    _this.turnAroundElement(opponent, opponentX, opponentY, radius, val);
                    val = (tweenValue + playerDelta) * Math.PI;
                    _this.turnAroundElement(player, playerX, playerY, radius, val);
                };
                opponent.velocity({ tween: [1, 0] }, { duration: 3000, progress: progress, complete: cb });
            };
            var removeIcon = function (cb) {
                iconClone.fadeOut({ duration: 500, complete: function () {
                        iconClone.remove();
                        cb();
                    } });
            };
            magnifyIcon(function () {
                turnAroundScore(function () {
                    removeIcon(function () {
                        completeCb();
                    });
                });
            });
        };
        return TurnAround;
    })(Skill);
    return TurnAround;
});
//# sourceMappingURL=turnAround.js.map