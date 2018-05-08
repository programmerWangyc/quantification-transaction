export enum LocalStorageKey {
    username = 'username',
    token = 'missionId',
    refUrl = 'refUrl',
    refUser = 'refUser'
}

export enum Path {
    home = 'home',
    square = 'square',
    fact = 'fact',
    community = 'community',
    doc = 'doc',
    market = 'market',
    analyze = 'analyze',
    robot = 'robot',
    strategy = 'strategy',
    trustee = 'trustee',
    exchange = 'exchange',
    simulate = 'simulate',
    dashboard = 'dashboard',
}

export enum VariableType {
    NUMBER_TYPE,
    BOOLEAN_TYPE,
    STRING_TYPE,
    SELECT_TYPE,
    ENCRYPT_STRING_TYPE,
    BUTTON_TYPE
}

export enum NotificationType {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'INFO'
}

export enum CommandRobotTip {
    invalidRobotState = 'COMMAND_ROBOT_STATE_ERROR_TIP',
    invalidNumberTypeArg = 'COMMAND_ROBOT_NUMBER_TYPE_ARG_ERROR_TIP',
    invalidStringTypeArg = 'COMMAND_ROBOT_EMPTY_STRING_ARG_ERROR_TIP',
    invalidCommandLength = 'COMMAND_ROBOT_LENGTH_ERROR_TIP'
}

export enum LogTypes {
    BUY,
    SALE,
    RETRACT,
    ERROR,
    PROFIT,
    MESSAGE,
    RESTART
}

export enum ServerSendRobotEventType {
    UPDATE_STATUS = 1 << 0, // 状态栏
    UPDATE_PROFIT = 1 << 1, // 
    UPDATE_SUMMARY = 1 << 2, // 
    UPDATE_PUSH = 1 << 3, // none used
    UPDATE_REFRESH = 1 << 4, // 日志
    UPDATE_DEBUG = 1 << 5 //
}

/** ==========================================================Front end custom data structure======================================== **/

export interface RobotOperateMap {
    tip: string;
    btnText: string[];
}

export interface VariableTypeDes {
    id: number;
    name: string;
    inputType: string;
}

export interface ArgOptimizeSetting {
    begin: number;
    end: number;
    step: number;
};

export interface VariableOverview {
    variableName: string;
    variableDes: string;
    variableComment: string; // 从页面上看貌似只能是这个
    variableValue: string | number | boolean;
    variableTypeId: number;
    originValue: string | number;
}

export interface TemplateVariableOverview {
    variables: VariableOverview[];
    id: number;
    name: string;
    category: number;
}

export interface RobotConfigForm {
    robotName: string;
    kLinePeriod: number;
    platform: number; // 交易平台，和 stock合成交易对
    stock: string;
    agent: number;
}

export interface SelectedPair {
    platformId: number;
    stock: string;
    platformName: string;
}

export interface ImportedArg {
    variableName: string;
    variableValue: string | number | boolean;
    templateId?: number;
}

export interface ConfirmOperateTipData {
    message: string;
    needTranslate: boolean;
}

export interface RobotStatusTable {
    type: string;
    title: string;
    cols: string[];
    rows: any[][];
}