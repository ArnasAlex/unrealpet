define(["require", "exports", 'knockout', '../../../core/services/services', './presenter', './game'], function (require, exports, ko, services, Presenter, Game) {
    var Main = (function () {
        function Main() {
            var _this = this;
            this.presenter = new Presenter(this);
            this.isVisible = ko.observable(false);
            this.game = new Game();
            this.energy = ko.observable(0);
            this.maxEnergy = ko.observable(0);
            this.start = function (fightOptions) {
                _this.game.init(_this.presenter);
                _this.presenter.init(_this.game);
                _this.reset();
                _this.game.fightId = fightOptions.fightId;
                _this.game.energy = fightOptions.energy();
                _this.energy(fightOptions.energy());
                _this.maxEnergy(fightOptions.maxEnergy);
                _this.gameOverCallback = fightOptions.gameOverCallback;
                _this.isVisible(true);
                services.ui.toggleBodyScrollBar(false);
                _this.game.setPictures(fightOptions.playerPicture(), fightOptions.opponentPicture);
                _this.game.start();
            };
            this.hide = function () {
                _this.isVisible(false);
                services.ui.toggleBodyScrollBar(true);
                _this.gameOverCallback(_this.game.isOver());
            };
            this.energyPercent = ko.computed(function () {
                var result = Math.floor(_this.energy() / _this.maxEnergy() * 100);
                return result + '%';
            });
            this.energyText = ko.computed(function () {
                var result = _this.energy() + ' / ' + _this.maxEnergy();
                return result;
            });
        }
        Main.prototype.activate = function () {
        };
        Main.prototype.deactivate = function () {
        };
        Main.prototype.reset = function () {
            $('.duel .result').remove();
        };
        return Main;
    })();
    return Main;
});
//# sourceMappingURL=main.js.map