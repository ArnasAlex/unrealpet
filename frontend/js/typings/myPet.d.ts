/// <reference path='refs.d.ts' />
/// <reference path="../../../interface/refs.d.ts" />

interface Window {
    mltId: IMlt;
    mlt: (mltId) => string;
    getTarget: (evt: Event) => JQuery;
    FB: any;
}

interface IModalOptions {
    msg: string;
    title?: string;
    showSecondButton?: boolean;
    closeCb?: (result: ModalResult) => void;
    primaryBtnLbl?: string;
    secondaryBtnLbl?: string;
}

declare const enum ModalResult {
    NotSet = 0,
    Primary = 1,
    Secondary = 2,
    Close = 3
}

interface IAlertOptions {
    msg: string;
    type: AlertType;
    icon?: string;
    waitLonger?: boolean;
}

declare const enum AlertType {
    Success = 0,
    Info = 1,
    Warning = 2,
    Danger = 3
}

interface INameValue<T> {
    name: string;
    value: T;
}

interface IMltOptions {
    id: string;
    values: string[];
}

interface IGameFightsOptions {
    energy: KnockoutObservable<number>;
    maxEnergy: number;
    gameOverCallback: (played: boolean) => void;
    fightId?: string;
    playerPicture?: KnockoutObservable<string>;
    opponentPicture?: string;
}

interface ISkillData {
    id: number;
    icon: string;
    position: number;
    type: SkillType;
    energy: number;
    name: string;
    description: string;
    status: SkillStatus;
    content: VoteResultControlSkill;

    data: any;
}