define(["require", "exports", 'knockout', '../../core/services/services', '../../routes', 'lodash', './arena/main'], function (require, exports, ko, services, routes, _, VoteResultControl) {
    var GameFights = (function () {
        function GameFights() {
            var _this = this;
            this.list = ko.observableArray([]);
            this.totalCount = 0;
            this.hasMore = ko.observable(true);
            this.pageSize = 12;
            this.voteResultControl = new VoteResultControl();
            this.refresh = function () {
                _this.list([]);
                _this.get();
            };
            this.moreClick = function () {
                _this.get();
            };
            this.fightClick = function (fight, evt) {
                if (fight.status !== 1) {
                    return;
                }
                var refresh = function (played) {
                    if (!played) {
                        return;
                    }
                    _this.refresh();
                    _this.options.gameOverCallback(played);
                };
                var startOptions = {
                    energy: _this.options.energy,
                    maxEnergy: _this.options.maxEnergy,
                    fightId: fight.id,
                    gameOverCallback: refresh,
                    playerPicture: _this.options.playerPicture,
                    opponentPicture: fight.opponentPicture
                };
                _this.voteResultControl.start(startOptions);
            };
            this.getCb = function (response) {
                if (response.totalCount) {
                    _this.totalCount = response.totalCount;
                }
                var retrievedList = _.map(response.list, function (x) { return new Fight(x); });
                var list = _this.list();
                var result = list.concat(retrievedList);
                _this.list(result);
                var hasMore = result.length < _this.totalCount;
                _this.hasMore(hasMore);
            };
            this.init();
        }
        GameFights.prototype.activate = function (options) {
            this.options = options;
        };
        GameFights.prototype.deactivate = function () {
        };
        GameFights.prototype.get = function () {
            var request = {
                skip: this.list().length,
                take: this.pageSize
            };
            services.server.get(routes.game.getGameFights, request).then(this.getCb);
        };
        GameFights.prototype.init = function () {
            this.get();
        };
        return GameFights;
    })();
    var Fight = (function () {
        function Fight(dto) {
            var _this = this;
            this.isWin = false;
            this.points = 0;
            this.pointsText = '';
            this.showResult = false;
            this.isLocked = false;
            this.isUnopened = false;
            this.getCss = function () {
                if (_this.showResult) {
                    return _this.isWin ? 'win' : 'defeat';
                }
                if (_this.isLocked) {
                    return 'locked';
                }
                return 'unopened';
            };
            _.assign(this, dto);
            this.resultText = dto.isWin
                ? window.mltId.game_fight_won
                : window.mltId.game_fight_lost;
            if (dto.points !== undefined) {
                this.pointsText = dto.points > 0
                    ? '+' + dto.points
                    : dto.points.toString();
            }
            this.timeAgo = services.util.getTimeAgo(dto.date);
            if (this.status === 1) {
                this.isUnopened = true;
            }
            else if (this.status === 2) {
                this.isLocked = true;
            }
            else {
                this.showResult = true;
            }
        }
        return Fight;
    })();
    return GameFights;
});
//# sourceMappingURL=gameFights.js.map