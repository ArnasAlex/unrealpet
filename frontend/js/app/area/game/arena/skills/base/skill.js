define(["require", "exports", '../../helper', '../../../../../core/services/services'], function (require, exports, Helper, services) {
    var Skill = (function () {
        function Skill() {
            var _this = this;
            this.showOriginalResult = function (cb) {
                var arena = $('.duel .arena');
                var resultContainer = $('<div class="result"></div>').appendTo(arena);
                var opponentScore = _this.getScoreString(_this.originalScore.opponent);
                var playerScore = _this.getScoreString(_this.originalScore.player);
                var opponent = $('<div class="score opponent-score">' + opponentScore + '</div>').appendTo(resultContainer);
                var player = $('<div class="score player-score">' + playerScore + '</div>').appendTo(resultContainer);
                opponent.addClass(_this.getScoreClass(_this.originalScore.opponent));
                player.addClass(_this.getScoreClass(_this.originalScore.player));
                $('.result .score').velocity('fadeIn', { complete: cb, delay: 500 });
            };
            this.getGoToElementPosition = function ($el, $destination) {
                var elPosition = $el.offset();
                var elWidth = $el.outerWidth();
                var elHeight = $el.outerHeight();
                var destinationPosition = $destination.offset();
                var destinationWidth = $destination.outerWidth();
                var destinationHeight = $destination.outerHeight();
                var widthDiff = destinationWidth - elWidth;
                var halfWidthDiff = Math.floor(widthDiff / 2);
                var heightDiff = destinationHeight - elHeight;
                var halfHeightDiff = Math.floor(heightDiff / 2);
                var top = Helper.getPositionDifference(destinationPosition.top, elPosition.top, halfHeightDiff);
                var left = Helper.getPositionDifference(destinationPosition.left, elPosition.left, halfWidthDiff);
                return {
                    top: top,
                    left: left
                };
            };
        }
        Skill.prototype.init = function (completeCb, originalScore, modifiedScore, $skill, skill) {
            this.completeCb = completeCb;
            this.originalScore = originalScore;
            this.modifiedScore = modifiedScore;
            this.$skill = $skill;
            this.opponentPic = $('.duel .opponent .player-container .picture');
            this.skill = skill;
        };
        Skill.prototype.animate = function () {
            throw Error('Override animate function in skill class.');
        };
        Skill.prototype.cloneSkillIcon = function () {
            var skillIcon = this.getSkillIcon();
            var iconClone = this.cloneElement(skillIcon);
            return iconClone;
        };
        Skill.prototype.getScoreString = function (score) {
            return Helper.getScoreString(score);
        };
        Skill.prototype.getSkillIcon = function () {
            return this.$skill.find('i');
        };
        Skill.prototype.getArena = function () {
            return $('.arena');
        };
        Skill.prototype.cloneElement = function (el, appendToParent) {
            if (appendToParent === void 0) { appendToParent = true; }
            return services.ui.cloneElement(el, appendToParent);
        };
        Skill.prototype.beforeAction = function (cb) {
            cb(false);
        };
        Skill.prototype.showDamageOnOpponent = function (damage) {
            var $el = $('<i class="damage-points"></i>');
            $el.appendTo(this.getArena());
            var text = this.getScoreString(-damage);
            $el.text(text);
            var coordinates = this.opponentPic.offset();
            coordinates.top += this.opponentPic.outerHeight() - $el.outerHeight();
            coordinates.left += this.opponentPic.outerWidth() - $el.outerWidth();
            $el.offset(coordinates);
            setTimeout(function () {
                $el.remove();
            }, 3000);
        };
        Skill.prototype.getScoreClass = function (score) {
            if (score < 0) {
                return 'minus';
            }
            if (score > 0) {
                return 'plus';
            }
            return 'zero';
        };
        return Skill;
    })();
    return Skill;
});
//# sourceMappingURL=skill.js.map