/// <reference path="../../../typings/refs.d.ts" />
import kovalid = require('knockout.validation');
import ko = require('knockout');
import uploadComponent = require('../components/uploadButton/uploadButtonComponent');
import postSearchGrid = require('../components/postSearchGrid/postSearchGrid');
import postComponent = require('../components/post/postComponent');
import voteGame = require('../components/voteGame/voteGame');

export class KnockoutExtensions {
    public static init() {
        KnockoutExtensions.initHelpers();
        KnockoutExtensions.initValidation();
        KnockoutExtensions.initCustomBindings();
        KnockoutExtensions.initComponents();
    }

    private static initHelpers() {
        ko.observableArray.fn.pushAll = function(valuesToPush) {
            var underlyingArray = this();
            this.valueWillMutate();
            ko.utils.arrayPushAll(underlyingArray, valuesToPush);
            this.valueHasMutated();
            return this;
        };
    }

    private static initValidation() {
        kovalid.init(<any>{
            errorElementClass: 'has-error',
            errorMessageClass: 'help-block',
            decorateInputElement: true,
            insertMessages: false
        });

        this.registerCustomValidation();
        ko.validation.registerExtenders();
    }

    private static registerCustomValidation() {
        ko.validation.rules['areSame'] = {
            getValue: (o) => {
                return (typeof o === 'function' ? o() : o);
            },
            validator: function(val, otherField) {
                return val === this.getValue(otherField);
            },
            message: 'The fields must have the same value'
        };

        ko.validation.rules['mustBeFilledOne'] = {
            validator: function (val, otherVal) {
                return val || otherVal;
            },
            message: 'Must be filled at least one field'
        };

        ko.validation.rules['imageUrl'] = {
            async: true,
            validator: ( val, params, callback ) => {
                var skipValidation = params.skipValidation ? params.skipValidation() : false;
                if (skipValidation){
                    return;
                }
                var hasImageExtension = val.match(/\.(jpeg|jpg|gif|png)$/) != null;
                if (!hasImageExtension) {
                    setTimeout(() => {
                        callback(false);
                    });

                    return;
                }

                var timeout = 5000;
                var timedOut = false, timer;
                var img = new Image();
                img.onerror = img.onabort = () => {
                    if (!timedOut) {
                        clearTimeout(timer);
                        callback(false);
                    }
                };
                img.onload = () => {
                    if (!timedOut) {
                        clearTimeout(timer);
                        callback(true);
                    }
                };
                img.src = val;
                timer = setTimeout(() => {
                    timedOut = true;
                    callback(false);
                }, timeout);
            },
            message: 'Invalid picture url'
        };
    }

    private static initCustomBindings() {
        ko.bindingHandlers.fadeVisible = {
            init: (element, valueAccessor) => {
                var value = valueAccessor();
                $(element).toggle(ko.unwrap(value));
            },
            update: (element, valueAccessor) => {
                var value = valueAccessor();
                ko.unwrap(value) ? $(element).fadeIn() : $(element).fadeOut();
            }
        };

        ko.bindingHandlers.fadeVisibleSwitcher = {
            init: (element, valueAccessor) => {
                var value = valueAccessor();
                $(element).toggle(ko.unwrap(value));
            },
            update: (element, valueAccessor) => {
                var value = valueAccessor();
                ko.unwrap(value) ? $(element).fadeIn() : $(element).hide();
            }
        };

        ko.bindingHandlers.showWithAnimation = {
            init: (element, valueAccessor) => {
                var options = valueAccessor();
                var value = options.value;

                $(element).toggle(ko.unwrap(value));
            },
            update: (element, valueAccessor) => {
                var options = valueAccessor();
                var show = options.show ? options.show : 'fadeIn';
                var hide = options.hide ? options.hide : 'fadeOut';
                var value = options.value;

                ko.unwrap(value)
                    ? $(element).velocity(show, { duration: 500 })
                    : $(element).velocity(hide, { duration: 500 })
            }
        };

        ko.bindingHandlers.jqueryWidget = {
            init: (element, valueAccessor) => {
                var value: any = ko.utils.unwrapObservable(valueAccessor());
                var options = ko.toJS(value.options);
                var jObj: any = $(element);
                jObj[value.name](options);
            }
        };

        ko.bindingHandlers.mlt = {
            init: (element, valueAccessor) => {
                var value = valueAccessor();
                var translated = window.mlt(ko.unwrap(value));
                $(element).text(translated);
            }
        };

        ko.bindingHandlers.placeholderMlt = {
            init: (element, valueAccessor) => {
                var value = valueAccessor();
                var translated = window.mlt(ko.unwrap(value));

                ko.applyBindingsToNode(element, { attr: { placeholder: translated } } );
            }
        };

        ko.bindingHandlers.enter = {
            init: function (element, valueAccessor, allBindings, viewModel) {
                var callback = valueAccessor();
                $(element).keypress(function (event) {
                    var keyCode = (event.which ? event.which : event.keyCode);
                    if (keyCode === 13) {
                        callback.call(viewModel);
                        return false;
                    }
                    return true;
                });
            }
        };

        ko.bindingHandlers.popover = {
            init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
                var options = ko.utils.unwrapObservable(valueAccessor());
                var defaultOptions = {};
                options = $.extend(true, {}, defaultOptions, options);
                $(element).popover(options);
            }
        };
    }

    private static initComponents() {
        new uploadComponent.UploadButtonComponent().register();
        new postSearchGrid.PostSearchGrid().register();
        new postComponent.PostComponent().register();
        new voteGame.VoteGame().register();
    }
}