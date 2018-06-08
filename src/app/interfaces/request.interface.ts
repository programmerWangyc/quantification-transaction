
export interface WsRequest {
    method: string[];
    params: any[][];
}

/** ===================================================Auth========================================= **/

// login
export interface LoginRequest {
    username: string;
    password: string; // encoded password;
    secondaryVerificationCode?: string; // google  secondary verification code
}

// signup
export interface SignupRequest {
    username: string;
    email: string;
    password: string; // encoded password;
    refUser: string; // referrer
    refUrl: string;
}

// reset password
export interface ResetPasswordRequest {
    email: string;
}

// set password
export interface SetPasswordRequest {
    token: string;
    password: string;
}

// verify password
export interface VerifyPasswordRequest {
    password: string;
}

/** ===================================================Setting========================================= **/

// get settings
export enum SettingTypes {
    about = 'about',
    agreement = 'agreement',
    api = 'api',
    promotion = 'promotion',
    docker = 'docker',
    brokers = 'brokers',
    index = 'index'
}

export interface SettingsRequest {
    type: string;
}

/** ===================================================Exchange========================================= **/

// exchange list
export interface GetExchangeListRequest { }

/** ===================================================Robot========================================= **/

// robot list
export interface GetRobotListRequest {
    start: number; // 查询的起始位置
    limit: number; // 每次查询的数量
    status: number; // 机器人的状态
}

// public robot
export interface PublicRobotRequest {
    id: number;
    type: number; // 0 放弃公开 1 公开
}

// robot detail
export interface GetRobotDetailRequest {
    id: number;
}

// robot logs
export interface GetRobotLogsRequest {
    robotId: number;
    // Log
    logMinId: number;
    logMaxId: number;
    // 查询起点位置，和传page其实一样，只不过用这种方式需要前台把这个值计算出来，比如当前limit === 20, 当前页是3，那么查询下一页时这个值就应该是60;
    logOffset: number;
    logLimit: number;
    // Profit
    profitMinId: number;
    profitMaxId: number;
    profitOffset: number;
    profitLimit: number;
    // Chart
    chartMinId: number;
    chartMaxId: number;
    chartOffset: number;
    chartLimit: number;
    chartUpdateBaseId: number;
    chartUpdateTime: number;
}

// subscribe robot
export interface SubscribeRobotRequest {
    id: number; // 0的时候取消订阅；
}

// restart robot
export interface RestartRobotRequest {
    id: number;
}

// stop robot
export interface StopRobotRequest {
    id: number;
}

// modify robot config
export interface ModifyRobotRequest {
    id: number;
    name: string;
    nodeId: number;
    kLinePeriodId: number;
    platform: number[];
    stocks: string[];
    args: string;
}

// command robot
export interface CommandRobotRequest {
    id: number;
    command: string;
}

// delete robot
export interface DeleteRobotRequest {
    id: number;
    checked: boolean;
}

// create robot
export interface SaveRobotRequest {
    name: string;
    args: string; // JSON type string;
    strategyId: number;
    kLineId: number;
    pairExchanges: number[];
    pairStocks: string[]; // string ? number?
    nodeId: number;
}

// plugin run
export interface ExchangePair {
    pid: number; // platform id;
    pair: string; // stock name;
}

export interface PluginRunRequest {
    period: number;
    source: string; // codemirror content
    node: number; // node id
    exchanges: ExchangePair[];
}

/** ===================================================Node list========================================= **/

export const getNodeList = 'GetNodeList';

export interface GetNodeListRequest { }

/** ===================================================Platform list========================================= **/

export interface GetPlatformListRequest { }

/** ===================================================Watch dog========================================= **/

// robot watch dog
export interface SetRobotWDRequest {
    robotId: number;
    watchDogStatus: number;
}

/** ===================================================Strategy============================================== **/

// strategy list
export enum CategoryType {
    GENERAL_STRATEGY,
    COMMODITY_FUTURES,
    STOCK_SECURITY,
    DIGITAL_CURRENCY = 9,
    TEMPLATE_LIBRARY = 20,
    TEMPLATE_SNAPSHOT = 30,
}

export enum needArgsType {
    none,  // need not args
    onlyStrategyArg, // only need current strategy args
    all // need all args ,include template info args
}

export interface GetStrategyListRequest {
    offset: number;
    limit: number;
    strategyType: number;
    categoryType: number;
    needArgsType: number;
}

// share strategy
export enum StrategyShareType {
    CANCEL_PUBLISH,
    PUBLISH,
    SELL
}

export interface ShareStrategyRequest {
    id: number; // strategy id
    type: number; // Strategy share type;
}

// gen key
export enum GenKeyType {
    PUBLISH,
    SELL
}

export interface GenKeyRequest {
    type: number; // gen key type: 0 publish, 1, sell
    strategyId: number;
    days: number;
    concurrent: number;
}

// verify gen key
export interface VerifyKeyRequest {
    strategyId: number;
    verifyCode: string;
}

// delete strategy
export interface DeleteStrategyRequest {
    id: number;
}

// OpStrategyToken
export enum OpStrategyTokenType {
    GET,
    UPDATE,
    DELETE
}

export interface OpStrategyTokenRequest {
    strategyId: number;
    opCode: number; // indicate code operate
}

// strategy detail
export interface GetStrategyDetailRequest {
    id: number;
}

// save strategy
export interface SaveStrategyRequest {
    id: number;
    categoryId: number;
    languageId: number;
    name: string;
    des: string;
    args: string; // JSON type string;
    code: string;
    note: string;
    manual: string;
    dependance: number[]; // templateId[];
}

/** ===================================================Charge============================================== **/

export interface GetPayOrdersRequest { }

export interface GetPaymentArgRequest {
    payMethod: number;
    strategyId: number; // If not strategy case, pass 0;
    chargeAmount: number;
}

/**
 * 接口总数： 83， 已完成： 31
 */
