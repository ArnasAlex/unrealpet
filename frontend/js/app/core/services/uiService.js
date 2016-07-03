define(["require", "exports"], function (require, exports) {
    var UiService = (function () {
        function UiService() {
            var _this = this;
            this.topBarHeight = 50;
            this.scrollSubscribers = [];
            this.isModalReady = false;
            this.modalSelector = '#modal';
            this.cloneElement = function (target, appendToParent) {
                if (appendToParent === void 0) { appendToParent = true; }
                var clone = target.clone();
                var initialCss = {
                    'position': 'absolute',
                    'left': target.position().left,
                    'top': target.position().top,
                    'z-index': 9999
                };
                clone.css(initialCss);
                if (appendToParent) {
                    clone.appendTo(target.parent());
                }
                return clone;
            };
            this.onScrollVisibleBottom = function (elementCb, cb) {
                var id = new Date().getTime();
                var subscriber = {
                    id: id,
                    elementSelector: elementCb,
                    callback: cb
                };
                _this.scrollSubscribers.push(subscriber);
                if (_this.scrollSubscribers.length === 1) {
                    $(window).on('scroll', _this.onScroll);
                }
                return id;
            };
            this.offScrollVisibleBottom = function (id) {
                var subscriber = _.find(_this.scrollSubscribers, function (x) { return x.id === id; });
                var index = _this.scrollSubscribers.indexOf(subscriber);
                _this.scrollSubscribers.splice(index, 1);
                if (_this.scrollSubscribers.length === 0) {
                    $(window).off('scroll', _this.onScroll);
                }
            };
            this.animateBell = function () {
                var bell = $('.navbar-fixed-top .navbar-title .bell');
                var clone = _this.cloneElement(bell);
                bell.css('visibility', 'hidden');
                var targetFontSize = parseInt(bell.css('font-size'));
                var distance = 60;
                var fontSizeIncrease = 15;
                clone.velocity({ top: '+=' + distance, fontSize: targetFontSize + fontSizeIncrease, color: '#00FF00' }, { duration: 1500, delay: 1000 }).velocity('callout.swing', 700).velocity({ top: '-=' + distance, fontSize: targetFontSize, color: '#FFFF00' }, 1500).velocity('callout.swing', 700, function () {
                    clone.remove();
                    bell.css('visibility', 'visible');
                });
            };
            this.rgb2hex = function (rgb) {
                if (/^#[0-9A-F]{6}$/i.test(rgb))
                    return rgb;
                rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                function hex(x) {
                    return ("0" + parseInt(x).toString(16)).slice(-2);
                }
                return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
            };
            this.onScroll = function () {
                _.each(_this.scrollSubscribers, function (subscriber) {
                    var el = subscriber.elementSelector();
                    var isVisible = _this.isElementOnBottomVisible(el);
                    if (isVisible) {
                        subscriber.callback();
                    }
                });
            };
            this.animateBadges = function (badges) {
                for (var i = 0; i < badges.length; i++) {
                    var badge = $(badges[i]);
                    var clone = _this.cloneElement(badge, false);
                    var parent = badge.parents()[1];
                    clone.appendTo(parent);
                    clone.velocity({ top: '-=50', opacity: '0' }, 5000);
                }
            };
            this.toggleBodyScrollBar = function (show) {
                var val = show ? 'visible' : 'hidden';
                $('body').css('overflow', val);
            };
        }
        UiService.prototype.showMessage = function (options) {
            this.modalValues = options;
            if (this.isModalReady) {
                $(this.modalSelector).modal('show');
            }
            else {
                this.waitForModalReady();
            }
        };
        UiService.prototype.waitForModalReady = function () {
            var _this = this;
            if ($(this.modalSelector).attr('data-ready') !== 'true') {
                setTimeout(function () {
                    _this.waitForModalReady();
                });
            }
            else {
                this.isModalReady = true;
                $(this.modalSelector).modal('show');
            }
        };
        UiService.prototype.showAlert = function (options) {
            this.alertAddedCb(options);
        };
        UiService.prototype.showError = function (msg, waitLonger) {
            if (!msg) {
                msg = window.mltId.server_error_default;
            }
            msg = window.mlt(msg);
            this.showAlert({
                msg: msg,
                type: 3,
                icon: 'fa-exclamation',
                waitLonger: waitLonger
            });
        };
        UiService.prototype.getModalValues = function () {
            return this.modalValues;
        };
        UiService.prototype.registerAlertComponent = function (alertAddedCb) {
            this.alertAddedCb = alertAddedCb;
        };
        UiService.prototype.scrollWhenCollapse = function (target, topMargin) {
            if (topMargin === void 0) { topMargin = 20; }
            var top = target.offset().top;
            if ($(window).scrollTop() > top) {
                var offset = topMargin + this.topBarHeight;
                target.velocity('scroll', { duration: 500, offset: -offset });
            }
        };
        UiService.prototype.scrollTo = function (target) {
            target.velocity('scroll', { duration: 500, offset: -this.topBarHeight });
        };
        UiService.prototype.animatePaw = function (evt, fadeIn) {
            var target = window.getTarget(evt);
            if (!target.is('i')) {
                target = target.find('i');
            }
            var pawSize = 250;
            var targetFontSize = parseInt(target.css('font-size'));
            var offset = targetFontSize / 2 - pawSize / 2;
            var paw = $('<i class="fa fa-paw"></i>');
            var initialCss = {
                'position': 'absolute',
                'left': target.position().left + (fadeIn ? offset : 0),
                'top': target.position().top + (fadeIn ? offset : 0),
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
            var endCb = function () {
                paw.remove();
            };
            paw.velocity(animationProperties, 1000, endCb);
        };
        UiService.prototype.getClassForPetType = function (petType) {
            var types = [];
            types[2 /* Cat */] = 'cat';
            types[3 /* Dog */] = 'dog';
            types[4 /* Bird */] = 'bird';
            types[6 /* Reptile */] = 'reptile';
            types[7 /* Horse */] = 'horse';
            types[5 /* Rodent */] = 'rodent';
            types[1 /* Other */] = 'other';
            var prefix = 'pet-type-';
            return prefix + types[petType];
        };
        UiService.prototype.isElementOnBottomVisible = function (el) {
            if (el instanceof jQuery) {
                el = el[0];
            }
            if (!el) {
                return false;
            }
            var rect = el.getBoundingClientRect();
            return rect.top <= (window.innerHeight || document.documentElement.clientHeight);
        };
        return UiService;
    })();
    exports.UiService = UiService;
});
//# sourceMappingURL=uiService.js.map