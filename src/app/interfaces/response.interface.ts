import { TemplateVariableOverview, VariableOverview } from './app.interface';

//  =======================================================Abstract response=========================================================

export type ResponseItem = string | number | boolean | { [key: string]: any } | JSON;

export interface ResponseState {
    error: string;
    action?: string; // custom field at front end, indicate the response from serve belongs to which action.
}

export interface ResponseBody extends PublicResponse {
    result: ResponseUnit<ResponseItem>[] | ServerSendRobotMessage | ServerSendBacktestMessage<string>;
}

export interface ResponseUnit<T> extends ResponseState {
    result: T;
}

export interface ServerSendMessage<T> extends PublicResponse {
    result: T;
}

//  =======================================================Public section of response=========================================================

export interface PublicResponse {
    balance: number;
    cached: boolean;
    callbackId: string;
    // responseActionName: string;
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
 *    Interfaces and enums below are all response related;
 */

//  =======================================================Server send message=========================================================

export enum ServerSendEventType {
    ROBOT = 'robot',
    NODE = 'node',
    RSYNC = 'rsync', // remote sync
    PAYMENT = 'payment',
    CHARGE = 'charge',
    BACKTEST = 'backtest',
}

export interface ServerSendRobotMessage {
    flags: number;
    id: number;
    status?: number;
    profit?: number;
    refresh?: number;
    summary?: string;
}

export interface ServerSendPaymentMessage {
    orderId?: string; // TODO: ensure field
}

export interface ServerSendBacktestMessage<T> {
    output: string;
    status: T; // default: string, JSON type string. parse result: BacktestResult;
    uuid: string;
}

//  =======================================================Auth response=========================================================

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


//  =======================================================Setting response=========================================================

// get settings
export interface IndexSetting {
    showLogo: string;
}

/**
 * 获取 docker 时的响应
 */
export interface DockerSetting {
    version: string;
    update: string;
    base: string;
    rpcBase: string;
}

/**
 * 获取 broker 的响应
 */
export interface BrokerNet {
    quote: string[];
    name: string;
    trade: string[];
}

export interface BrokerGroup {
    name: string;
    nets: BrokerNet[];
}

export interface Broker {
    key: string;
    name: string;
    type: number;
    brokerId: string;
    groups: BrokerGroup[];
}

export type SettingResResult = string & DockerSetting & IndexSetting & Broker;

export interface SettingsResponse extends ResponseUnit<SettingResResult> { }

//  =======================================================Exchange response=========================================================

// exchange list
export interface ExchangeMetaData {
    desc: string;
    required: boolean;
    type: string;
    name: string;
    label: string;
    encrypt?: boolean;
    def?: string;
    length?: number;
    maxlength?: number;
    checkbox?: string;
}

export interface Exchange {
    eid: string;
    id: number;
    logo: string;
    meta: string | ExchangeMetaData[]; // parse result ExchangeMetaData[];
    name: string;
    priority: number;
    website: string;
}

export interface ExchangeListResponse {
    exchanges: Exchange[];
}

export interface GetExchangeListResponse extends ResponseUnit<ExchangeListResponse> { }


// ===================================================Robot=========================================

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
    node_public?: number;
    profit: number;
    public: number;
    refresh: number;
    start_time: string;
    status: number;
    strategy_id: number;
    strategy_isowner: boolean;
    strategy_name: string;
    wd: number;
    summary?: string; // !FIXME: 这个字段从接口上看目前还没有发现， 但从代码上看貌似有, 待确定。
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
    DISCLOSED, // 公开
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
    strategy_exchange_pairs: string; // "[4,[-1],["BTC_USD"]]" 0： k 线周期的ID。1: 交易所ID; 2: 股票；
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

export type RuntimeLog = [string, number, number, string | number, string, number, number, string, string, string];

export type CommonLog = Array<string | number>;

// robot logs
export interface LogOverview {
    Total: number;
    Max: number;
    Min: number;
    Arr: Array<string | number>[];
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
    Arr: RunningLog[]; // 每一个元素都是一个长度为10的数组
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
    runningLog?: RunningLogOverview; // logs[0];
    profitLog?: ProfitLogOverview; // logs[1];
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
export interface StopRobotResponse extends ResponseUnit<number> { } // !FIXME: 这个响应类型是要根据原代码猜的，不知道对不对。

// update robot config
export interface ModifyRobotResponse extends ResponseUnit<boolean> { }

// command robot
export interface CommandRobotResponse extends ResponseUnit<boolean> { }

// delete robot
export interface DeleteRobotResponse extends ResponseUnit<number> { }

// create robot
export interface SaveRobotResponse extends ResponseUnit<number | string> { }

// plugin run
export interface DebugLog {
    PlatformId: string;
    OrderId: string;
    LogType: number;
    Price: number;
    Amount: number;
    Extra: string;
    Instrument: string;
    Direction: string;
    Time: number;
}

export interface PluginRunResult {
    result: string; // JSON type string;
    logs: DebugLog[];
}

export interface PluginRunResponse extends ResponseUnit<string> { }

// ===================================================Agent=============================================

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

// delete node
export interface DeleteNodeResponse extends ResponseUnit<number> { }

// get node hash
export interface GetNodeHashResponse extends ResponseUnit<string> { }

// ===================================================Platform===============================================

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

// delete platform;
export interface DeletePlatformResponse extends ResponseUnit<boolean> { }

// platform detail
export interface PlatformAccessKey {
    [key: string]: any;
}

export interface PlatformMeta {
    desc: string;
    encrypt?: boolean;
    label: string;
    name: string;
    required: boolean;
    type: string;
}

export interface PlatformDetail {
    access_key: string; // JSON type string; Parse result: PlatformAccessKey;
    date: string;
    eid: string;
    id: number;
    label: string;
    logo: string;
    meta: PlatformMeta[];
    name: string;
    website: string;
}

export interface PlatformDetailResponse {
    platform: PlatformDetail;
}

export interface GetPlatformDetailResponse extends ResponseUnit<PlatformDetailResponse> { }

// save platform

export interface SavePlatformResponse extends ResponseUnit<boolean> { }

// ===================================================Watch dog=========================================

// watch dog
export interface SetWDResponse extends ResponseUnit<boolean> { }

// ===================================================Strategy==============================================

interface StrategyBase {
    category: number;
    date: string;
    email: string;
    forked: number;
    id: number;
    is_buy: boolean;
    is_owner: boolean;
    language: number;
    last_modified: string;
    name: string;
    public: number;
    username: string;
}

// strategy list
export enum StrategyPublicState {
    UNDISCLOSED, // 未公开
    DISCLOSED,
    VERIFY,
    PREMIUM,
}

export interface Strategy extends StrategyBase {
    args?: string; // JSON type string
    buy_count?: number;
    expire_date?: string;
    hasToken: boolean; // indicate has remote edit token;
    pricing?: string; // 斜线分割的自定义格式，天数/价格
    templates?: number[]; // 模板的ID, 在category 是30的响应里找， var  item = category是30中的某一个， item.id === 这个数组中的id，item.args 就是这个模板的 arg
    username: string;
    // 以下两个字段是自定义字段
    semanticArgs?: VariableOverview[]; // from args field
    semanticTemplateArgs?: TemplateVariableOverview[]; // form template snapshot
}

export interface StrategyListResponse {
    all: number;
    strategies: Strategy[];
}

export interface GetStrategyListResponse extends ResponseUnit<StrategyListResponse> { }

// share strategy
export interface ShareStrategyResponse extends ResponseUnit<boolean> { }

// gen key
export interface GenKeyResponse extends ResponseUnit<string> { }

// verify gen key
export interface VerifyKeyResponse extends ResponseUnit<boolean> { }

// delete strategy
export interface DeleteStrategyResponse extends ResponseUnit<number | boolean> { } // true if delete success;

// op strategy token
export interface OpStrategyTokenResponse extends ResponseUnit<string> { }

// strategy detail
export interface StrategyTemplate {
    args: string; // JSON type string;
    category: number;
    id: number;
    language: number;
    name: string;
    source: string;
}

export interface TemplateSnapshot {
    args: string; // JSON type string;
    category: number;
    id: number;
    language: number;
    name: string;
    source: string; // code
    // custom args
    semanticArgs?: VariableOverview[];
}

export interface StrategyDetail extends StrategyBase {
    args: string;
    description: string;
    expire_date: string;
    manual: string;
    note?: string;
    source?: string;
    templates?: TemplateSnapshot[];
    // custom filed
    semanticArgs?: VariableOverview[];
}

export interface StrategyDetailResponse<T> {
    strategy: T;
}

export interface GetStrategyDetailResponse extends ResponseUnit<StrategyDetailResponse<StrategyDetail>> { }

// public strategy detail
export interface PublicStrategyDetail extends StrategyDetail {
    is_deleted: boolean;
    pricing?: string;
    source?: string; // code;
}

export interface GetPublicStrategyDetailResponse extends ResponseUnit<StrategyDetailResponse<PublicStrategyDetail>> { }

// save strategy
export interface SaveStrategyResponse extends ResponseUnit<string | boolean> { }

// strategy list by name
export interface StrategyListByNameStrategy extends StrategyBase {
    args?: string;
    email: string;
    username: string;
    pricing?: string;
}

export interface StrategyListByNameResponse {
    all: number;
    strategies: StrategyListByNameStrategy[];
}

export interface GetStrategyListByNameResponse extends ResponseUnit<StrategyListByNameResponse> { }

// ===================================================Backtest==============================================

// get templates
export interface TemplatesResponse {
    id: number;
    source: string;
}

export interface GetTemplatesResponse extends ResponseUnit<TemplatesResponse[]> { }

// backtestIO
/**
 * <<-----------------------------------------------------------------------------------
 * backtest task result start region
 */

export type BacktestResultChartData = [number, string/* JSON type string*/];

export interface BacktestResultChart {
    Cfg: string; // JSON type string;
    Datas: BacktestResultChartData[];
}

export interface BacktestResultSnapshot {
    Balance: number;
    BaseCurrency: string;
    Commission: number;
    FrozenBalance: number;
    FrozenStocks: number;
    Id: string;
    QuoteCurrency: string;
    Stocks: number;
    Symbols: Object;
    TradeStatus: BacktestResultTradeStatus;
    time?: number; // BacktestSnapshots 第一个元素。
}

export interface BacktestResultTradeStatus {
    sell: number;
    buy: number;
}

export interface BacktestResultIndicators {
    [key: string]: any[];
}


export interface BacktestTaskOptions {
    DataServer: string;
    MaxChartLogs: number;
    MaxProfitLogs: number;
    MaxRuntimeLogs: number;
    NetDelay: number;
    Period: number;
    RetFlags: number;
    SnapshortPeriod: number;
    TimeBegin: number;
    TimeEnd: number;
    UpdatePeriod: number;
}

export interface BacktestResultExchange {
    Balance: number;
    BaseCurrency: string;
    BasePeriod: number;
    BasePrecision: number;
    CurDots: number;
    Currency: string;
    DataSource: string;
    Depth: number;
    DepthDeep: number;
    FaultTolerant: number;
    Fee: number[];
    FeeDenominator: number;
    FeeMaker: number;
    FeeMin: number;
    FeeTaker: number;
    Id: string;
    Label: string;
    MaxBarLen: number;
    MinFee: number;
    Mode: number;
    Name: string;
    NetDelay: number;
    Period: number;
    PriceTick: number;
    QuoteCurrency: string;
    QuotePrecision: number;
    SlipPoint: number;
    Stocks: number;
    SymDots: number;
}

export interface BacktestTask {
    Args: null;
    End: number;
    Exchanges: BacktestResultExchange[];
    Options: BacktestTaskOptions;
    Start: number;
}

export interface BacktestResultSymbols {
    [key: string]: BacktestResultSymbol;
}

export interface BacktestResultSymbol {
    Last: number;
    Long?: BacktestResultSymbolProfit;
    Short?: BacktestResultSymbolProfit;
}

export interface BacktestResultSymbolProfit {
    Profit: number;
    Margin: number;
    CloseProfit: number;
}

export type BacktestSnapShots = [number, BacktestResultSnapshot[]];

// time, open, high, low, close, volume
export enum BacktestSymbolRecordIndex {
    time,
    open,
    high,
    low,
    close,
    volume,
}

export type BacktestSymbolRecords = [number, number, number, number, number, number];

// node's eid, node's stock, symbol, kline period, records
export enum BacktestSymbolIndex {
    eid,
    stock,
    symbol,
    klinePeriod,
    records,
}

export type BacktestSymbol = [string, string, string, number, BacktestSymbolRecords[]];

export enum BacktestRuntimeLogIndex {
    id,
    time,
    logType,
    eid,
    orderId,
    price,
    amount,
    extra, // 样式的信息
    contractType,
    direction,
}

export type BacktestProfitLog = [number, number]; // time, profit

export interface BacktestResult {
    Chart: BacktestResultChart;
    CloseProfitLogs?: any[];
    Elapsed: number;
    Exception: string;
    Finished: boolean;
    Indicators: BacktestResultIndicators;
    LoadBytes: number;
    LoadElapsed: number;
    LogsCount: number;
    Pending?: any;
    Profit: number;
    ProfitLogs: BacktestProfitLog[];
    Progress: number;
    RuntimeLogs: RuntimeLog[]; // 每一个元素都是一个长度为10的数组
    Snapshort?: BacktestResultSnapshot[];
    Snapshorts: Array<BacktestSnapShots>;
    Stderr: string;
    Task: BacktestTask;
    TaskStatus?: number;
    Time: number;
    Status: string;
    Symbols: BacktestSymbol[];
    TradeStatus?: BacktestResultTradeStatus;
}

export interface ServerBacktestResult<T> {
    Code: number;
    Result: T; // string: uuid; object: BacktestResult;
}

/**
 * --------------------------------------------------------------------------------->>
 *  backtest task result endregion
 */

export interface BacktestIOResponse extends ResponseUnit<ServerBacktestResult<string | BacktestResult> | string | number> { } // string: 解析后的结果就是 ServerBacktestResult;

// ===================================================Charge==============================================

export interface PayOrder {
    date: string;
    id: number;
    order_guid: string;
}

export interface PayOrdersResponse {
    balance: number;
    consumed: number;
    items: PayOrder[];
}

export interface GetPayOrdersResponse extends ResponseUnit<PayOrdersResponse> { }

// payment arg
export interface PaymentArg {
    body: string;
    notify_url: string;
    out_trade_no: string;
    partner: string;
    payment_type: string;
    return_url: string;
    seller_email: string;
    service: string;
    sign: string;
    sign_type: string;
    subject: string;
    total_fee: string;
    _input_charset: string;
}

export interface PaymentArgResponse {
    form?: PaymentArg;
    code_url?: string;
}

export interface GetPaymentArgResponse extends ResponseUnit<PaymentArgResponse> { }

// ===================================================Comment==============================================

// submit comment
export interface SubmitCommentResponse extends ResponseUnit<number> { } // reply: reply's id; other 影响的行数；

// comment list
export interface BtComment {
    content: string;
    created: string; // created date string;
    id: number;
    is_owner: boolean;
    username: string;
}

export interface Reply extends BtComment {
    reply_id: number;
    sub_reply_id?: number;
}

export interface CommentListResponse {
    all: number;
    comments: BtComment[];
    reply: Reply[];
}

export interface GetCommentListResponse extends ResponseUnit<CommentListResponse> { }

// get qiniu token
export interface GetQiniuTokenResponse extends ResponseUnit<string> { }
