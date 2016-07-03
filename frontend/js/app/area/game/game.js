define(["require", "exports", 'knockout', '../../core/services/services', '../../routes', 'lodash'], function (require, exports, ko, services, routes, _) {
    var Game = (function () {
        function Game() {
            this.player = new Player();
            this.leaderBoard = new LeaderBoard();
            this.isAuthenticated = services.currentAccount.isAuthenticated;
            this.sectionButtonClick = function (model, evt) {
                var button = window.getTarget(evt).closest('button');
                var elId = button.data('scroll');
                var el = $('#' + elId);
                services.ui.scrollTo(el);
            };
            this.init();
        }
        Game.prototype.init = function () {
            var _this = this;
            this.player.get();
            this.leaderBoard.get();
            this.voteGameOptions = {
                showPlayButton: false,
                energyChangedCb: function (energy) {
                    _this.player.energy(energy);
                },
                refreshEnergy: null
            };
        };
        Game.prototype.activate = function (petId) {
            var _this = this;
            this.fightControlOptions = {
                energy: this.player.energy,
                maxEnergy: this.player.maxEnergy,
                gameOverCallback: function () {
                    _this.player.get();
                    _this.voteGameOptions.refreshEnergy();
                },
                playerPicture: this.player.picture
            };
        };
        Game.prototype.deactivate = function () {
        };
        return Game;
    })();
    var Player = (function () {
        function Player() {
            var _this = this;
            this.picture = ko.observable('');
            this.points = ko.observable(0);
            this.fights = ko.observable(0);
            this.wins = ko.observable(0);
            this.defeats = ko.observable(0);
            this.place = ko.observable(0);
            this.totalPlayers = ko.observable(0);
            this.status = ko.observable(0 /* NotPlaying */);
            this.isRegistered = ko.observable(false);
            this.petTypeCss = ko.observable('');
            this.energy = ko.observable(0);
            this.maxEnergy = 20;
            this.hasGift = ko.observable(false);
            this.get = function () {
                services.server.get(routes.game.getPlayerInfo, {}).then(function (response) {
                    _this.fights(response.fights | 0);
                    _this.points(response.points | 0);
                    _this.wins(response.wins | 0);
                    _this.defeats(response.defeats | 0);
                    _this.isRegistered(response.isRegistered);
                    _this.status(response.status | 0 /* NotPlaying */);
                    _this.picture(response.pictureUrl ? response.pictureUrl : '');
                    _this.totalPlayers(response.totalPlayers | 0);
                    _this.place(response.place | 0);
                    _this.hasGift(response.hasGift);
                    if (!_this.isRegistered()) {
                        _this.setPetType();
                    }
                });
            };
            this.changePlayerStatus = function () {
                var newStatus = _this.getNewStatus();
                var req = {
                    status: newStatus
                };
                services.server.post(routes.game.changePlayerStatus, req).then(function () {
                    _this.status(newStatus);
                });
            };
            this.openGift = function (model, evt) {
                services.server.post(routes.game.openGift, {}).then(function (response) {
                    _this.openGiftCb(response, evt);
                });
            };
            this.openGiftCb = function (response, evt) {
                var $container = window.getTarget(evt);
                if (!$container.is('div')) {
                    $container = $container.closest('div');
                }
                var text = '+' + response.points;
                var $el = $('<span></span>');
                $el.text(text);
                $el.hide();
                $el.appendTo($container);
                var $gamePoints = $container.closest('.panel').find('#game-points');
                $container.find('i').velocity('fadeOut', { complete: function () {
                    $el.velocity('fadeIn', { complete: function () {
                        $container.velocity('fadeOut', { duration: 1500, delay: 500, complete: function () {
                            $gamePoints.velocity({ backgroundColor: '#663399' }, { duration: 500 }).velocity('reverse', { delay: 1000, begin: function () {
                                _this.points(_this.points() + response.points);
                            }, complete: function () {
                                $gamePoints.css('background-color', '');
                            } });
                        } });
                    } });
                } });
            };
            this.uploadPictureCb = function (response) {
                if (response.error) {
                    return;
                }
                if (_this.isRegistered()) {
                    _this.picture(response.pictureUrl);
                    return;
                }
                _this.get();
            };
            this.init();
        }
        Player.prototype.init = function () {
            var _this = this;
            this.uploadOptions = {
                uploadUrl: routes.game.uploadPlayerPicture,
                data: null,
                btnText: ko.computed(function () {
                    return !_this.picture() ? window.mltId.game_upload_picture : window.mltId.game_change_picture;
                }),
                uploadCb: this.uploadPictureCb,
                fileType: 1 /* Picture */
            };
            this.playerBackgroundImage = ko.computed(function () {
                return 'url(' + _this.picture() + ')';
            });
            this.statusText = ko.computed(function () {
                var statuses = {};
                statuses[0 /* NotPlaying */] = window.mltId.game_player_status_not_playing;
                statuses[1 /* Playing */] = window.mltId.game_player_status_playing;
                statuses[2 /* Stopped */] = window.mltId.game_player_status_stopped;
                return statuses[_this.status()];
            });
            this.playButtonText = ko.computed(function () {
                return _this.status() === 1 /* Playing */ ? window.mltId.game_stop_game : window.mltId.game_join_game;
            });
            this.playButtonIcon = ko.computed(function () {
                return _this.status() === 1 /* Playing */ ? 'fa-pause' : 'fa-play';
            });
        };
        Player.prototype.getNewStatus = function () {
            var statusWorkflow = {};
            statusWorkflow[0 /* NotPlaying */] = 1 /* Playing */;
            statusWorkflow[1 /* Playing */] = 2 /* Stopped */;
            statusWorkflow[2 /* Stopped */] = 1 /* Playing */;
            var newStatus = statusWorkflow[this.status()];
            return newStatus;
        };
        Player.prototype.setPetType = function () {
            var css = services.ui.getClassForPetType(1 /* Other */);
            this.petTypeCss(css);
        };
        return Player;
    })();
    var LeaderBoard = (function () {
        function LeaderBoard() {
            var _this = this;
            this.list = ko.observableArray([]);
            this.totalCount = 0;
            this.hasMore = ko.observable(true);
            this.pageSize = 10;
            this.leaderClick = function (leader, evt) {
                services.nav.goToUrl('#posts/' + leader.accountId);
            };
            this.moreClick = function () {
                if (!_this.hasMore()) {
                    return;
                }
                _this.get();
            };
            this.refresh = function () {
                _this.list([]);
                _this.get();
            };
            this.getCb = function (response) {
                if (response.totalCount) {
                    _this.totalCount = response.totalCount;
                }
                var retrievedList = _.map(response.list, function (x) { return new GameLeader(x); });
                var list = _this.list();
                var result = list.concat(retrievedList);
                _this.list(result);
                var hasMore = result.length < _this.totalCount;
                _this.hasMore(hasMore);
            };
        }
        LeaderBoard.prototype.get = function () {
            var request = {
                skip: this.list().length,
                take: this.pageSize
            };
            services.server.get(routes.game.getGameLeaders, request).then(this.getCb);
        };
        return LeaderBoard;
    })();
    var GameLeader = (function () {
        function GameLeader(leader) {
            for (var prop in leader) {
                this[prop] = leader[prop];
            }
            if (!this.picture) {
                this.picture = '';
            }
            this.petTypeClass = services.ui.getClassForPetType(leader.type);
            this.placeClass = this.getPlaceClass(this.place);
        }
        GameLeader.prototype.getPlaceClass = function (place) {
            if (place < 10) {
                return '';
            }
            else if (place < 100) {
                return 'dozen';
            }
            else if (place < 1000) {
                return 'hundred';
            }
            else if (place >= 1000) {
                return 'thousand';
            }
        };
        return GameLeader;
    })();
    return Game;
});
//# sourceMappingURL=game.js.map