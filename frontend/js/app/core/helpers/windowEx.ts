/// <reference path="../../../typings/refs.d.ts" />
export class WindowHelpers {
    public static register(){
        WindowHelpers.registerGetTarget();
    }

    private static registerGetTarget(){
        window.getTarget = (evt: Event) => {
            return $(evt.target || evt.srcElement);
        }
    }
}