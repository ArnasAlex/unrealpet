///<reference path="knockout.d.ts"/>

interface KnockoutBindingHandlers {
    fadeVisible: KnockoutBindingHandler;
    fadeVisibleSwitcher: KnockoutBindingHandler;
    jqueryWidget: KnockoutBindingHandler;
    mlt: KnockoutBindingHandler;
    placeholderMlt: KnockoutBindingHandler;
    enter: KnockoutBindingHandler;
    showWithAnimation: KnockoutBindingHandler;
    popover: KnockoutBindingHandler;
}

interface KnockoutObservableArrayFunctions<T> {
    pushAll(array: T[]): T[];
}