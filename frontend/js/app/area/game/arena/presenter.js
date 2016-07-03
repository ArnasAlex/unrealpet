define(["require", "exports", './helper', './menu', './skills', '../../../core/services/services'], function (require, exports, Helper, Menu, Skills, services) {
    var Presenter = (function () {
        function Presenter(main) {
            var _this = this;
            this.elements = new Elements();
            this.showEndingMenu = function (isWin, points) {
                _this.elements.menu.show(isWin, points, _this.game.playerPicture);
            };
            this.moveSkillToLogo = function (skill, originalScore, modifiedScore, cb) {
                var logo = _this.elements.logo;
                var logoPosition = logo.offset();
                var logoSize = logo.outerWidth();
                var $skill = _this.elements.skills.getSkillElement(skill.id);
                _this.elements.skills.updateSkillStatus(4, skill, $skill);
                var skillPosition = $skill.offset();
                var skillSize = $skill.outerWidth();
                var sizeDiff = logoSize - skillSize;
                var halfSizeDiff = Math.floor(sizeDiff / 2);
                $skill.velocity({
                    top: Helper.getPositionDifference(logoPosition.top, skillPosition.top, halfSizeDiff),
                    left: Helper.getPositionDifference(logoPosition.left, skillPosition.left, halfSizeDiff)
                }, { complete: function () {
                        _this.elements.skills.updateSkillStatus(5, skill, $skill);
                        _this.elements.skills.animate(skill, originalScore, modifiedScore, cb);
                    } });
            };
            this.revertSkill = function (skill) {
                _this.elements.skills.revertSkill(skill);
            };
            this.toggleLogoActivation = function (active) {
                _this.elements.logo.toggleClass('active', active);
            };
            this.showNotEnoughEnergy = function () {
                services.ui.showAlert({
                    msg: window.mltId.game_not_enough_energy,
                    type: 2,
                    icon: 'fa-bolt'
                });
            };
            this.main = main;
        }
        Presenter.prototype.init = function (game) {
            this.game = game;
            this.elements.init(game, this);
            this.reset();
            this.bind();
        };
        Presenter.prototype.addSkill = function (skill) {
            this.elements.skills.add(skill);
        };
        Presenter.prototype.setPictures = function () {
            Helper.setBackgroundPicture(this.elements.playerPicture, this.game.playerPicture);
            Helper.setBackgroundPicture(this.elements.opponentPicture, this.game.opponentPicture);
        };
        Presenter.prototype.reset = function () {
            this.elements.menu.container.hide();
            this.elements.menu.content.hide();
            this.elements.menu.overlay.hide();
            this.elements.skills.reset();
        };
        Presenter.prototype.bind = function () {
            var _this = this;
            this.elements.menu.button.click(function () {
                _this.main.hide();
            });
        };
        return Presenter;
    })();
    var Elements = (function () {
        function Elements() {
            this.menu = new Menu();
            this.skills = new Skills();
        }
        Elements.prototype.init = function (game, presenter) {
            this.arena = $('.duel .arena');
            this.opponentPicture = this.arena.find('.opponent .picture');
            this.playerPicture = this.arena.find('.player .picture');
            this.logo = this.arena.find('.logo');
            this.menu.init(this.arena);
            this.skills.init(this.arena, game, presenter);
        };
        return Elements;
    })();
    return Presenter;
});
//# sourceMappingURL=presenter.js.map