/// <reference path='../../../../typings/refs.d.ts' />
class Helper {
    static setBackgroundPicture($el: JQuery, url: string) {
        var val = `url("${url}")`;
        $el.css('background-image', val);
    }

    static getPositionDifference(a: number, b: number, addition: number = 0){
        var diff = a - b;
        var isLess = diff < 0;
        var prefix = isLess ? '-' : '+';
        if (isLess){
            addition *= -1;
        }
        return prefix + '=' + (Math.abs(diff) + addition);
    }


    static getScoreString(score: number){
        if (score > 0){
            return '+' + score;
        }

        return score.toString();
    }
}

export = Helper;