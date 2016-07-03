/// <reference path="../../../typings/refs.d.ts" />
export class UtilService {
    getTimeAgo(isoDate: string): string{
        var date = new Date(isoDate);
        var diff = new Date().getTime() - date.getTime();
        var seconds = Math.floor(diff / 1000);

        var interval = Math.floor(seconds / 31536000);

        if (interval >= 1) {
            return this.formatTimeAgo(interval, window.mltId.date_short_year);
        }
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) {
            return this.formatTimeAgo(interval, window.mltId.date_short_month);
        }
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) {
            return this.formatTimeAgo(interval, window.mltId.date_short_day);
        }
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) {
            return this.formatTimeAgo(interval, window.mltId.date_short_hour);
        }
        interval = Math.floor(seconds / 60);
        if (interval >= 1) {
            return this.formatTimeAgo(interval, window.mltId.date_short_minute);
        }

        var interval = Math.floor(seconds);
        if (interval <= 0){
            interval = 1;
        }

        return this.formatTimeAgo(interval, window.mltId.date_short_second);
    }

    private formatTimeAgo(interval: number, unit: string){
        return interval + unit;
    }
}