/// <reference path='../../../../typings/refs.d.ts' />
import Helper = require('./helper');

class Menu {
    container: JQuery;
    content: JQuery;
    overlay: JQuery;
    text: JQuery;
    picture: JQuery;
    button: JQuery;

    private wonClass = 'won';
    private lostClass = 'lost';

    init(arena: JQuery) {
        this.container = arena.find('.end-menu-container');
        this.content = this.container.find('.end-menu');
        this.overlay = this.container.find('.end-menu-overlay');
        this.text = this.content.find('.text span');
        this.picture = this.content.find('.picture');
        this.button = this.content.find('button');
    }

    show(isWin: boolean, points: number, playerPicture: string) {
        var pointsText = Helper.getScoreString(points);
        var resultText = isWin ? window.mltId.game_fight_won : window.mltId.game_fight_lost;
        var text = `${resultText} (${pointsText})`;
        this.text.text(text);

        Helper.setBackgroundPicture(this.picture, playerPicture);

        this.container.show();
        $('.duel .end-menu, .duel .end-menu-overlay').velocity('fadeIn', {delay: 700, duration: 1000});

        this.content.removeClass(`${this.wonClass} ${this.lostClass}`);
        var backgroundClass = isWin ? this.wonClass : this.lostClass;
        this.content.addClass(backgroundClass);
    }
}

export = Menu;