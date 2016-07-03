define(["require", "exports", 'lodash', './skills/turnAround', './skills/guessWinner', './skills/bomb', './skills/doublePoints'], function (require, exports, _, TurnAround, GuessWinner, Bomb, DoublePoints) {
    var Skills = (function () {
        function Skills() {
            var _this = this;
            this.skillSelector = '.skill';
            this.getDescriptionOptions = function (skill) {
                return {
                    content: _this.getSkillDescriptionContent(skill),
                    html: true,
                    placement: 'top',
                    template: _this.getSkillDescriptionTemplate(),
                    trigger: 'manual'
                };
            };
            this.onMouseDown = function (evt) {
                var target = window.getTarget(evt);
                if (!target.hasClass('skill')) {
                    target = target.closest('.skill');
                }
                var skill = _this.getSkillFromElement(target);
                _this.updateSkillStatus(2, skill, target);
                target.popover('show');
                $('body').one('mouseup', function (evt) {
                    _this.onMouseUp(target);
                });
            };
            this.onMouseUp = function (target) {
                if (!target.hasClass('skill')) {
                    target = target.closest('.skill');
                }
                var skill = _this.getSkillFromElement(target);
                if (skill.status !== 3) {
                    _this.updateSkillStatus(0, skill, target);
                }
                target.popover('hide');
                _this.presenter.toggleLogoActivation(false);
            };
            this.useSkill = function (skill) {
                _this.beforeAction(skill, function (cancel) {
                    if (cancel) {
                        _this.revertSkill(skill);
                    }
                    else {
                        _this.game.skillUsed(skill);
                    }
                });
            };
            this.showGuessWinner = function (skill, selectedCb) {
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
                container.find('button').click(function (evt) {
                    var btn = window.getTarget(evt);
                    var value = btn.data('guess') === 'me';
                    skill.data = value;
                });
                $(window).one('click', function (evt) {
                    container.velocity('fadeOut', { complete: function () {
                            container.remove();
                            selectedCb();
                        } });
                });
            };
            this.canBeDragged = function (skill) {
                var result = !_this.game.isOver() && skill.status !== 4;
                return result;
            };
        }
        Skills.prototype.init = function (arena, game, presenter) {
            this.game = game;
            this.presenter = presenter;
            this.container = arena.find('.skills');
            this.bind();
        };
        Skills.prototype.add = function (skill) {
            var $skill = this.createSkillElement(skill);
            $skill.appendTo(this.container);
            this.bindSkillEvents($skill);
        };
        Skills.prototype.getSkillElement = function (id) {
            var skills = this.container.find(this.skillSelector);
            var skill = _.find(skills, function (x) { return $(x).data('id') == id; });
            return $(skill);
        };
        Skills.prototype.updateSkillStatus = function (status, skill, $el) {
            skill.status = status;
            this.refreshSkillClasses(skill, $el);
        };
        Skills.prototype.animate = function (skill, originalScore, modifiedScore, cb) {
            var animation = this.getSkillAnimation(skill);
            var $skill = this.getSkillElement(skill.id);
            animation.init(cb, originalScore, modifiedScore, $skill, skill);
            animation.animate();
        };
        Skills.prototype.beforeAction = function (skill, cb) {
            var animation = this.getSkillAnimation(skill);
            var $skill = this.getSkillElement(skill.id);
            animation.init(cb, null, null, $skill, skill);
            animation.beforeAction(cb);
        };
        Skills.prototype.getSkillAnimation = function (skill) {
            var animations = [];
            animations[0] = TurnAround;
            animations[1] = Bomb;
            animations[3] = DoublePoints;
            animations[2] = GuessWinner;
            var animation = animations[skill.content];
            if (!animation) {
                throw Error('Animation not found for skill id: ' + skill.id);
            }
            return new animation();
        };
        Skills.prototype.createSkillElement = function (skill) {
            var template = this.getTemplate();
            var $skill = $(template);
            $skill.data('id', skill.id);
            $skill.find('span').text(skill.energy);
            $skill.find('i').addClass(skill.icon);
            $skill.addClass(this.getClasses(skill));
            var descriptionOptions = this.getDescriptionOptions(skill);
            $skill.popover(descriptionOptions);
            return $skill;
        };
        Skills.prototype.getClasses = function (skill) {
            var classes = [
                'skill',
                this.getPositionClass(skill.position),
                this.getSkillTypeClass(skill.type),
                this.getClassByStatus(skill.status)
            ];
            return classes.join(' ');
        };
        Skills.prototype.getPositionClass = function (position) {
            return 'skill-' + position;
        };
        Skills.prototype.getSkillTypeClass = function (type) {
            var types = [];
            types[0] = 'neutral';
            types[1] = 'benefit';
            types[2] = 'damage';
            return types[type];
        };
        Skills.prototype.getTemplate = function () {
            return "<div>\n                    <i class=\"fa skill-icon\"></i>\n                    <span class=\"badge energy\"></span>\n                </div>";
        };
        Skills.prototype.getSkillDescriptionTemplate = function () {
            return '<div class="popover skill-description" role="tooltip">' +
                '<div class="arrow"></div>' +
                '<h3 class="popover-title"></h3>' +
                '<div class="popover-content"></div>' +
                '</div>';
        };
        Skills.prototype.getSkillDescriptionContent = function (skill) {
            return "<div class=\"pull-right\"><span class=\"badge energy\">" + skill.energy + "</span></div>\n            <div class=\"text-center title\">" + skill.name + "</div>\n            <div class=\"clearfix\"></div>\n            <div class=\"text-center picture\"><i class=\"fa " + skill.icon + "\"></i></div>\n            <div class=\"explanation\">" + skill.description + "</div>";
        };
        Skills.prototype.getClassByStatus = function (status) {
            var classes = [];
            classes[1] = '';
            classes[0] = '';
            classes[2] = 'active';
            classes[3] = 'valid';
            classes[4] = '';
            classes[5] = '';
            return classes[status];
        };
        Skills.prototype.getSkillById = function (id) {
            var skill = this.game.getSkill(id);
            return skill;
        };
        Skills.prototype.getSkillFromElement = function ($el) {
            var skillId = parseInt($el.data('id'));
            var skill = this.getSkillById(skillId);
            return skill;
        };
        Skills.prototype.refreshSkillClasses = function (skill, $el) {
            $el.removeClass();
            var classes = this.getClasses(skill);
            $el.addClass(classes);
        };
        Skills.prototype.bind = function () {
            this.container.on('mousedown', this.skillSelector, this.onMouseDown);
        };
        Skills.prototype.bindSkillEvents = function ($skill) {
            var _this = this;
            var self = this;
            $skill.draggable({
                distance: 20,
                drag: function (evt, ui) {
                    var target = window.getTarget(evt);
                    var canBeDropped = _this.skillStartCoordinates.top - 100 > ui.position.top;
                    var skill = _this.getSkillFromElement(target);
                    var status = 2;
                    if (canBeDropped) {
                        status = 3;
                    }
                    _this.updateSkillStatus(status, skill, target);
                    _this.presenter.toggleLogoActivation(canBeDropped);
                },
                start: function (evt, ui) {
                    _this.skillStartCoordinates = ui.helper.position();
                    var target = window.getTarget(evt);
                    var skill = _this.getSkillFromElement(target);
                    target.popover('hide');
                    if (!_this.canBeDragged(skill)) {
                        skill.status = 0;
                        return false;
                    }
                    if (!_this.game.isEnoughEnergyForSkill(skill)) {
                        _this.presenter.showNotEnoughEnergy();
                        return false;
                    }
                },
                revert: function () {
                    var target = $(this);
                    var skill = self.getSkillFromElement(target);
                    if (skill.status !== 3) {
                        skill.status = 1;
                        return true;
                    }
                    self.useSkill(skill);
                }
            });
        };
        Skills.prototype.revertSkill = function (skill) {
            var _this = this;
            var $skill = this.getSkillElement(skill.id);
            $skill.velocity({ top: this.skillStartCoordinates.top, left: this.skillStartCoordinates.left }, { complete: function () {
                    var skill = _this.getSkillFromElement($skill);
                    _this.updateSkillStatus(1, skill, $skill);
                } });
        };
        Skills.prototype.reset = function () {
            this.container.find(this.skillSelector).remove();
        };
        return Skills;
    })();
    return Skills;
});
//# sourceMappingURL=skills.js.map