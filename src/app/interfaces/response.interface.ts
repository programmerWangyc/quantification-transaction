/* =======================================================Abstract response========================================================= */

export type ResponseItem = string | number | boolean | { [key: string]: any } | JSON;

export interface ResponseState {
    error: string;
    action?: string; // custom field at front end, indicate the response from serve belongs to which action.
}

export interface ResponseBody extends PublicResponse {
    result: ResponseUnit<ResponseItem>[];
}

export interface ResponseUnit<T> extends ResponseState {
    result: T;
}


/* =======================================================Public section of response========================================================= */

export interface PublicResponse {
    balance: number;
    cached: boolean;
    callbackId: string;
    consumed: number;
    error: string;
    is_admin: boolean;
    notify: number;
    token: string;
    username: string;
    version: number;
}



/**
 * <------------
 *  @description  Interfaces and enums below are all response related;
 */

/* =======================================================Auth response========================================================= */

// login 
export interface LoginResponse extends ResponseUnit<number> { }

// signup
export interface SignupResponse extends ResponseUnit<number> { }

// reset password
export interface ResetPasswordResponse extends ResponseUnit<boolean> { }

// set password
export interface SetPasswordResponse extends ResponseUnit<boolean> { }

// verify password
export interface VerifyPasswordResponse extends ResponseUnit<boolean> { }


/* =======================================================Auth response========================================================= */

// get settings
export interface IndexSetting {
    showLogo: string;
}

export interface SettingsResponse extends ResponseUnit<string | IndexSetting> { }

/* =======================================================Exchange response========================================================= */

// exchange list
export interface ExchangeMetaData {
    desc: string;
    required: boolean;
    type: string;
    name: string;
    label: string;
}

export interface Exchange {
    eid: string;
    id: number;
    logo: string;
    meta: ExchangeMetaData[];
    name: string;
    priority: number;
    website: string;
}

export interface ExchangeListResponse {
    exchanges: Exchange[];
}

export interface GetExchangeListResponse extends ResponseUnit<ExchangeListResponse> { }


/** ===================================================Robot========================================= **/

// robot list
export interface Robot {
    charge_time: number;
    date: string;
    end_time: string;
    id: number;
    is_sandbox: number;
    name: string;
    node_guid: string;
    node_id: number;
    profit: number;
    public: number;
    refresh: number;
    start_time: string;
    status: number;
    strategy_id: number;
    strategy_isowner: boolean;
    strategy_name: string;
    wd: number;
}

export enum RobotStatus {
    QUEUEING,
    RUNNING,
    STOPPING,
    COMPLETE,
    STOPPED,
    ERROR,
}

export enum RobotPublicStatus {
    UNDISCLOSED, // 未公开
    DISCLOSED // 公开
}

export interface RobotListResponse {
    all: number;
    concurrent: number;
    robots: Robot[];
}

export interface GetRobotListResponse extends ResponseUnit<RobotListResponse> { }

// public robot
export interface PublicRobotResponse extends ResponseUnit<boolean> { }

// robot detail 
export interface RobotDebug {
    Nano: number;
    Stderr: string;
    Stdout: string;
}

export interface IdToName {
    [key: number]: string;
}

export interface StrategyExchangePairs {
    kLinePeriod: number;
    exchangeIds: number[];
    stocks: string[];
}

export interface RobotDetail {
    charge_time: number;
    charged: number;
    consumed: number;
    date: string;
    debug: JSON;  // RobotDebug
    end_time: string;
    fixed_id: number;
    id: number;
    is_deleted: number;
    is_manager: boolean;
    is_sandbox: number;
    name: string;
    node_id: number;
    pexchanges: IdToName; // {id: exchangeName}
    plabels: IdToName; // { id: customName } 
    profit: number;
    public: number;
    refresh: number;
    robot_args: string;
    start_time: string;
    status: number;
    strategy_args: string; //"[]"
    strategy_exchange_pairs: string; //"[4,[-1],["BTC_USD"]]" 0： k 线周期的ID。1: 交易所ID; 2: 股票；
    strategy_id: number;
    strategy_last_modified: string;
    strategy_name: string;
    templates: any[];
    username: string;
    wd: number;
}

export interface RobotDetailResponse {
    robot: RobotDetail;
}

export interface GetRobotDetailResponse extends ResponseUnit<RobotDetailResponse> { }

// robot logs
export interface Logs {
    Total: number;
    Max: number;
    Min: number;
    Arr: any[][];
}

export interface RobotLogs {
    chart: string;
    chartTime: number;
    logs: Logs[];
    node_id: number;
    online: boolean;
    refresh: number;
    status: number;
    summary: string;
    updateTime: number;
    wd: number;
}

export interface GetRobotLogsResponse extends ResponseUnit<RobotLogs> { }

// subscribe robot
export interface SubscribeRobotResponse extends ResponseUnit<boolean> { }

// reboot robot
export enum RestartRobotResult {
    STRATEGY_EXPIRED = 1,
    NO_DOCKER_FOUND,
    INTERNAL_ERROR,
    ROBOT_IS_RUNNING,
    INSUFFICIENT_BALANCE,
    EXCEED_MAX_CONCURRENCY,
    PASSWORD_NEED,
    MEAL_EXPIRED,
}

export interface RestartRobotResponse extends ResponseUnit<number | string> { }

// stop robot
export interface StopRobotResponse extends ResponseUnit<any> { }

/** ===================================================Node list========================================= **/

// node list
export interface BtNode {
    build: string;
    city: string;
    date: string;
    id: number;
    ip: string;
    is_owner: boolean;
    loaded: number;
    name: string;
    online: boolean;
    os: string;
    public: number;
    region: string;
    version: string;
    wd: number;
}

export interface NodeListResponse {
    nodes: BtNode[];
}

export interface GetNodeListResponse extends ResponseUnit<NodeListResponse> { }

/** ===================================================Platform list========================================= **/

// platform list
export interface Platform {

}

export interface PlatformListResponse {
    platforms: Platform[];
}

export interface GetPlatformListResponse extends ResponseUnit<PlatformListResponse> { }

/** ===================================================Watch dog========================================= **/

// robot watch dog
export interface SetRobotWD extends ResponseUnit<any> { }





























/* ======================================= */
export interface SomethingResponse extends ResponseUnit<Something> { }

export interface Something {
    all: number;
    strategies: Strategy[];
}

export interface Strategy {
    args: string;
    category: number;
    date: string;
    forked: number;
    hasToken: boolean;
    id: number;
    is_buy: boolean;
    is_owner: boolean;
    language: boolean;
    last_modified: string;
    name: string;
    public: number;
    username: string;
}
/* ======================================= */
