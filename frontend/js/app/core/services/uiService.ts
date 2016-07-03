/// <reference path="../../../typings/refs.d.ts" />
import app = require('durandal/app');

export class UiService {
    private topBarHeight = 50;
    private modalValues: IModalOptions;
    private alertAddedCb: (options: IAlertOptions) => {};
    private scrollSubscribers: IScrollSubscriber[] = [];
    private isModalReady = false;
    private modalSelector = '#modal';

    constructor() {
    }

    showMessage(options: IModalOptions){
        this.modalValues = options;
        if (this.isModalReady){
            $(this.modalSelector).modal('show');
        }
        else{
            this.waitForModalReady();
        }
    }

    private waitForModalReady(){
        if ($(this.modalSelector).attr('data-ready') !== 'true'){
            setTimeout(() => {
                this.waitForModalReady();
            });
        }
        else{
            this.isModalReady = true;
            $(this.modalSelector).modal('show');
        }
    }

    showAlert(options: IAlertOptions){
        this.alertAddedCb(options);
    }

    showError(msg?: string, waitLonger?: boolean){
        if (!msg){
            msg = window.mltId.server_error_default;
        }

        msg = window.mlt(msg);

        this.showAlert({
            msg: msg,
            type: 3,
            icon: 'fa-exclamation',
            waitLonger: waitLonger
        });
    }

    getModalValues(): IModalOptions {
        return this.modalValues;
    }

    registerAlertComponent(alertAddedCb){
        this.alertAddedCb = alertAddedCb;
    }

    scrollWhenCollapse(target: JQuery, topMargin = 20){
        var top = target.offset().top;
        if ($(window).scrollTop() > top){
            var offset = topMargin + this.topBarHeight;
            target.velocity('scroll', {duration: 500, offset: -offset});
        }
    }

    scrollTo(target: JQuery){
        target.velocity('scroll', {duration: 500, offset: -this.topBarHeight});
    }

    animatePaw(evt: Event, fadeIn: boolean){
        var target = window.getTarget(evt);
        if (!target.is('i')){
            target = target.find('i');
        }

        var pawSize = 250;
        var targetFontSize = parseInt(target.css('font-size'));
        var offset = targetFontSize/2 - pawSize/2;
        var paw = $('<i class="fa fa-paw"></i>');
        var initialCss = {
            'position' : 'absolute',
            'left'     : target.position().left + (fadeIn ? offset : 0),
            'top'      : target.position().top + (fadeIn ? offset : 0),
            'font-size': (fadeIn ? pawSize : targetFontSize) + 'px',
            'z-index': 9999,
            'color': fadeIn ? '#f0ad4e' : '#333'
        };

        paw.css(initialCss);
        paw.appendTo(target.parent());
        var animationProperties = {
            fontSize: (fadeIn ? targetFontSize : pawSize) + 'px',
            opacity: 0.1,
            top: target.position().top + (fadeIn ? 0 : offset),
            left: target.position().left + (fadeIn ? 0 : offset)
        };

        var endCb = () => {
            paw.remove();
        };

        paw.velocity(animationProperties, 1000, endCb);
    }

    cloneElement = (target: JQuery, appendToParent = true) => {
        var clone = target.clone();
        var initialCss = {
            'position' : 'absolute',
            'left'     : target.position().left,
            'top'      : target.position().top,
            'z-index': 9999
        };

        clone.css(initialCss);
        if (appendToParent){
            clone.appendTo(target.parent());
        }

        return clone;
    };

    getClassForPetType(petType: PetType){
        var types = [];
        types[PetType.Cat] = 'cat';
        types[PetType.Dog] = 'dog';
        types[PetType.Bird] = 'bird';
        types[PetType.Reptile] = 'reptile';
        types[PetType.Horse] = 'horse';
        types[PetType.Rodent] = 'rodent';
        types[PetType.Other] = 'other';

        var prefix = 'pet-type-';
        return prefix + types[petType];
    }

    onScrollVisibleBottom = (elementCb: () => JQuery, cb: () => void): number => {
        var id = new Date().getTime();
        var subscriber: IScrollSubscriber = {
            id: id,
            elementSelector: elementCb,
            callback: cb
        };

        this.scrollSubscribers.push(subscriber);
        if (this.scrollSubscribers.length === 1){
            $(window).on('scroll', this.onScroll);
        }

        return id;
    };

    offScrollVisibleBottom = (id: number) => {
        var subscriber = _.find(this.scrollSubscribers, x => x.id === id);
        var index = this.scrollSubscribers.indexOf(subscriber);
        this.scrollSubscribers.splice(index, 1);
        if (this.scrollSubscribers.length === 0){
            $(window).off('scroll', this.onScroll);
        }
    };

    animateBell = () => {
        var bell = $('.navbar-fixed-top .navbar-title .bell');
        var clone = this.cloneElement(bell);
        bell.css('visibility', 'hidden');

        var targetFontSize = parseInt(bell.css('font-size'));
        var distance = 60;
        var fontSizeIncrease = 15;

        clone
            .velocity({top: '+=' + distance, fontSize: targetFontSize + fontSizeIncrease, color: '#00FF00'}, {duration: 1500, delay: 1000})
            .velocity('callout.swing', 700)
            .velocity({top: '-=' + distance, fontSize: targetFontSize, color: '#FFFF00'}, 1500)
            .velocity('callout.swing', 700, () => {
                clone.remove();
                bell.css('visibility', 'visible');
            });
    };

    private rgb2hex = (rgb) => {
        if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;

        rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        function hex(x) {
            return ("0" + parseInt(x).toString(16)).slice(-2);
        }

        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    };

    private onScroll = () => {
        _.each(this.scrollSubscribers, (subscriber: IScrollSubscriber) => {
            var el = subscriber.elementSelector();
            var isVisible = this.isElementOnBottomVisible(el);
            if (isVisible){
                subscriber.callback();
            }
        });
    };

    private isElementOnBottomVisible (el) {
        if (el instanceof jQuery) {
            el = el[0];
        }

        if (!el){
            return false;
        }

        var rect = el.getBoundingClientRect();

        return rect.top <= (window.innerHeight || document.documentElement.clientHeight);
    }

    animateBadges = (badges: JQuery) => {
        for (var i = 0; i < badges.length; i++){
            var badge = $(badges[i]);
            var clone = this.cloneElement(badge, false);
            var parent = badge.parents()[1];
            clone.appendTo(parent);
            clone.velocity({top: '-=50', opacity: '0'}, 5000);
        }
    };

    toggleBodyScrollBar = (show: boolean) => {
        var val = show ? 'visible' : 'hidden';
        $('body').css('overflow', val);
    }
}

interface IScrollSubscriber {
    id: number;
    elementSelector: () => JQuery;
    callback: () => void;
}