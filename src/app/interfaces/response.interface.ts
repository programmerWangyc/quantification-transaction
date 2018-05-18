/* =======================================================Abstract response========================================================= */

export type ResponseItem = string | number | boolean | { [key: string]: any } | JSON;

export interface ResponseState {
    error: string;
    action?: string; // custom field at front end, indicate the response from serve belongs to which action.
}

export interface ResponseBody extends PublicResponse {
    result: ResponseUnit<ResponseItem>[] | ServerSendRobotMessage;
}

export interface ResponseUnit<T> extends ResponseState {
    result: T;
}

export interface ServerSendMessage<T> extends PublicResponse {
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
    event?: string;
}

/**
 * <------------
 *  @description  Interfaces and enums below are all response related;
 */

/* =======================================================Server send message========================================================= */

export enum ServerSendEventType {
    ROBOT = 'robot',
    NODE = 'node',
    RSYNC = 'rsync', // remote sync
    PAYMENT = 'payment',
    CHARGE = 'charge',
    BACKTEST = 'backtest'
}

export interface ServerSendRobotMessage {
    flags: number;
    id: number;
    status?: number;
    profit?: number;
    refresh?: number;
    summary?: string;
}

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
    summary?: string; // FIXME: 这个字段从接口上看目前还没有发现， 但从代码上看貌似有, 待确定。
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

export interface RobotTemplate {
    args: string; // 'string | number[][]';
    id: number;
    name: string;
    category: number;
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
    robot_args: string; // string | number [][]
    start_time: string;
    status: number;
    strategy_args: string; // string | number[][] 0: variable name 1: variable description 2:variable value
    strategy_exchange_pairs: string; //"[4,[-1],["BTC_USD"]]" 0： k 线周期的ID。1: 交易所ID; 2: 股票；
    strategy_id: number;
    strategy_last_modified: string;
    strategy_name: string;
    templates: RobotTemplate[]; // 
    username: string;
    wd: number;
    summary?: string;
}

export interface RobotDetailResponse {
    robot: RobotDetail;
}

export interface GetRobotDetailResponse extends ResponseUnit<RobotDetailResponse> { }

// robot logs
export interface LogOverview {
    Total: number;
    Max: number;
    Min: number;
    Arr: Array<string | number>[]; // 每一个元素都是一个长度为10的数组
}

export interface RunningLog {
    id: number;
    logType: number;
    eid: string;
    orderId: string;
    price: number;
    amount: number;
    extra: string;
    date: string; // 日期的毫秒表示
    contractType: string;
    direction: string;
}

export interface RunningLogOverview {
    Total: number;
    Max: number;
    Min: number;
    Arr: RunningLog[];
}


export interface ProfitLog {
    id: number;
    time: number;
    profit: number;
}

export interface ProfitLogOverview {
    Total: number;
    Max: number;
    Min: number;
    Arr: ProfitLog[];
}

export interface StrategyLog { 
    id: number;
    seriesIdx: number;
    data: any;
}

export interface StrategyLogOverview {
    Total: number;
    Max: number;
    Min: number;
    Arr: StrategyLog[];
}

export interface SemanticsLogsOverview {
    runningLog: RunningLogOverview;
    profitLog: ProfitLogOverview;
    strategyLog: StrategyLogOverview;
}

export interface RobotLogs {
    chart: string; // JSON 字符串
    chartTime: number;
    logs: LogOverview[]; // 第一个元素是运行日志？第二个元素是收益日志信息？第三个元素是图表日志？
    node_id: number;
    online: boolean;
    refresh: number;
    status: number; // 机器人的状态。
    summary: string;
    updateTime: number;
    wd: number;
    // 以下3个字段根据logs字段的值扁平化的结果
    runningLog?: RunningLogOverview// logs[0];
    profitLog?: ProfitLogOverview;// logs[1];
    strategyLog?: StrategyLogOverview; // logs[2];
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
export interface StopRobotResponse extends ResponseUnit<number> { } //FIXME: 这个响应类型是要根据原代码猜的，不知道对不对。

// update robot config
export interface ModifyRobotResponse extends ResponseUnit<boolean> { }

// command robot
export interface CommandRobotResponse extends ResponseUnit<boolean> { }

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
    id: number;
    label: string;
    eid: string;
    name: string;
    stocks: string[];
    webSite?: string;
    logo?: string;
}

export interface PlatformListResponse {
    platforms: Platform[];
}

export interface GetPlatformListResponse extends ResponseUnit<PlatformListResponse> { }

/** ===================================================Watch dog========================================= **/

// robot watch dog
export interface SetRobotWDResponse extends ResponseUnit<boolean> { }





























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
