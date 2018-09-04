import { animate, AnimationTriggerMetadata, state, style, transition, trigger } from '@angular/animations';

export enum Path {
    account = 'account',
    add = 'add',
    agent = 'agent',
    auth = 'auth',
    analyze = 'analyze',
    backtest = 'backtest',
    charge = 'charge',
    code = 'code',
    community = 'community',
    copy = 'copy',
    dashboard = 'dashboard',
    debug = 'debug',
    doc = 'doc',
    edit = 'edit',
    exchange = 'exchange',
    fact = 'fact',
    google = 'google',
    home = 'home',
    key = 'key',
    market = 'market',
    message = 'message',
    nickname = 'nickname',
    rent = 'rent',
    reset = 'reset',
    robot = 'robot',
    simulation = 'simulation',
    square = 'square',
    strategy = 'strategy',
    usergroup = 'usergroup',
    verify = 'verify',
    warn = 'warn',
    wechat = 'wechat',
}

export enum LocalStorageKey {
    username = 'username',
    token = 'missionId',
    refUrl = 'refUrl',
    refUser = 'refUser',
    editorConfig = 'editorConfig',
    backtestAdvancedOptions = 'backtestAdvancedOptions',
}

export enum VariableType {
    NUMBER_TYPE,
    BOOLEAN_TYPE,
    STRING_TYPE,
    SELECT_TYPE,
    ENCRYPT_STRING_TYPE,
    BUTTON_TYPE,
}

export enum BtCommentType {
    square = 'square',
    competition = 'Competition',
    live = 'live',
    robot = 'R_',
    strategy = 'S_',
}

export enum LanguageMap {
    zh = 'SIMPLE_CHINESE',
    en = 'ENGLISH',
}

export function navAnimationTrigger(): AnimationTriggerMetadata {
    return trigger('moduleState', [
        state('inactive', style({
            opacity: 0,
        })),
        state('active', style({
            opacity: 1,
        })),
        transition('inactive => active', animate('300ms ease-in')),
        transition('active => inactive', animate('300ms ease-out')),
    ]);
}
