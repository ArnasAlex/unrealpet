var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'knockout', '../../services/services', '../../../routes', 'lodash', '../base/component'], function (require, exports, ko, services, routes, _, component) {
    var VoteGame = (function (_super) {
        __extends(VoteGame, _super);
        function VoteGame() {
            _super.apply(this, arguments);
            this.name = 'vote-game';
            this.createViewModel = function () {
                return new VoteGameModel();
            };
            this.template = { require: this.getBaseTemplatePath() + '/voteGame/voteGame.html' };
        }
        return VoteGame;
    })(component.Component);
    exports.VoteGame = VoteGame;
    var VoteGameModel = (function () {
        function VoteGameModel() {
            var _this = this;
            this.player1 = new Player();
            this.player2 = new Player();
            this.fightExist = ko.observable(false);
            this.isPlayButtonVisible = ko.observable(false);
            this.energy = ko.observable(0);
            this.availableEnergy = ko.observable(0);
            this.maxEnergy = 20;
            this.getEnergy = function () {
                if (services.currentAccount.isAuthenticated()) {
                    services.server.get(routes.game.getPlayerEnergy, {}).then(_this.getEnergyCb);
                }
                else {
                    _this.energy(0);
                    _this.availableEnergy(_this.maxEnergy);
                }
            };
            this.chooseWinner = function (player, evt) {
                var picture = window.getTarget(evt);
                var container = picture.closest('.panel-body');
                var pictures = container.find('.player .image');
                var covers = _.map(pictures, function (pic) {
                    var cover = services.ui.cloneElement($(pic));
                    cover.css({
                        'opacity': 1,
                        'z-index': 19,
                        'background-color': '#454545',
                        'background-image': '',
                        'display': 'none'
                    });
                    var logoHtml = '<div class="logo"></div>';
                    var logo = $(logoHtml);
                    logo.appendTo(cover);
                    return cover;
                });
                var clone = services.ui.cloneElement(picture);
                var newSize = container.outerWidth() - 4;
                if (newSize > picture.height() * 2) {
                    newSize = picture.height() * 2;
                }
                var toLeft = (newSize - picture.width()) / 2;
                var top = (container.outerHeight() - newSize) / 2 - picture.parent().position().top;
                var animationProperties = {
                    top: '+=' + top,
                    width: newSize,
                    height: newSize,
                    left: '-=' + toLeft
                };
                var checkHtml = '<div class="winner">' + '<div><i class="big-icon fa fa-check"></i></div>' + '<div class="place"><i class="fa fa-trophy place-icon"></i>' + player.place + '</div>' + '</div>';
                var energyIncrementHtml = '<div class="energy-increment"><i class="fa fa-bolt"></i></div>';
                var fadeInDuration = 300;
                var energyBar = $('.vote .energy .bar');
                clone.velocity(animationProperties, {
                    duration: fadeInDuration,
                    complete: function () {
                        var check = $(checkHtml);
                        check.appendTo(clone);
                        check.show();
                        var energyIncrement = $(energyIncrementHtml);
                        energyIncrement.appendTo(clone);
                        var energyIncrementDistance = energyBar.offset().top - energyIncrement.offset().top;
                        energyIncrement.velocity({
                            top: '+=' + energyIncrementDistance
                        }, {
                            duration: 1200,
                            complete: function () {
                                energyIncrement.remove();
                                _this.incrementEnergy();
                            }
                        });
                        var executedCb = false;
                        _.each(covers, function (cover) {
                            cover.show();
                        });
                        _this.winnerChosen(player.id);
                    }
                }).velocity('fadeOut', {
                    duration: 700,
                    delay: 1500,
                    complete: function () {
                        clone.remove();
                        var vs = picture.closest('.panel-body').find('.vs');
                        _this.animateVs(vs, covers);
                    }
                });
            };
            this.incrementEnergy = function () {
                if (_this.energy() >= _this.availableEnergy()) {
                    return;
                }
                _this.energy(_this.energy() + 1);
                if (_this.options.energyChangedCb) {
                    _this.options.energyChangedCb(_this.energy());
                }
            };
            this.animateVs = function (vs, covers) {
                var fadeInDuration = 500;
                vs.velocity({ backgroundColor: '#000000' }, { duration: fadeInDuration, complete: function () {
                    _.each(covers, function (cover) {
                        cover.velocity({ 'opacity': 0 }, {
                            duration: fadeInDuration,
                            complete: function () {
                                cover.remove();
                            }
                        });
                    });
                } }).velocity({ backgroundColor: '#ffffff' }, { delay: 200 });
            };
            this.getFightCb = function (response) {
                _this.fightId = response.id;
                _this.fightExist(!!_this.fightId);
                if (_this.fightExist()) {
                    _this.player1.update(response.players[0]);
                    _this.player2.update(response.players[1]);
                }
            };
            this.getEnergyCb = function (response) {
                _this.energy(response.energy);
                _this.availableEnergy(response.availableEnergy);
                if (_this.options.energyChangedCb) {
                    _this.options.energyChangedCb(_this.energy());
                }
            };
            this.energyPercent = ko.computed(function () {
                return Math.floor(_this.energy() / _this.maxEnergy * 100);
            });
            this.availableEnergyPercent = ko.computed(function () {
                return Math.floor(_this.availableEnergy() / _this.maxEnergy * 100);
            });
            this.energyText = ko.computed(function () {
                return _this.energy() + ' / ' + _this.availableEnergy();
            });
        }
        VoteGameModel.prototype.init = function (options, element) {
            var _this = this;
            this.options = options;
            this.isPlayButtonVisible(options.showPlayButton);
            services.currentAccount.isAuthenticated.subscribe(function () {
                _this.getFight();
            });
            this.getFight();
            this.getEnergy();
            this.options.refreshEnergy = this.getEnergy;
        };
        VoteGameModel.prototype.getFight = function () {
            services.server.get(routes.game.getGameFight, {}).then(this.getFightCb);
        };
        VoteGameModel.prototype.winnerChosen = function (playerId) {
            var req = {
                fightId: this.fightId,
                playerId: playerId
            };
            services.server.post(routes.game.chooseGameWinner, req).then(this.getFightCb);
        };
        return VoteGameModel;
    })();
    var Player = (function () {
        function Player() {
            this.picture = ko.observable('');
        }
        Player.prototype.update = function (dto) {
            this.id = dto.id;
            this.place = dto.place;
            this.picture(dto.picture);
        };
        return Player;
    })();
});
//# sourceMappingURL=voteGame.js.map