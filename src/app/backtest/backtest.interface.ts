import { VariableOverview } from '../interfaces/app.interface';
import { BacktestPutTaskParams } from '../interfaces/request.interface';
import { BacktestResult, BacktestResultChart, BacktestResultSnapshot } from '../interfaces/response.interface';

export interface TimeRange {
    start: Date;
    end: Date;
}

export interface BacktestTimeConfig extends TimeRange {
    klinePeriodId: number;
}

export interface BacktestPlatform {
    eid: string;
    name: string;
    stocks: string[];
    quoteCurrency: string;
    group: string;
    balance: number;
    remainingCurrency: number;
    makerFee: number;
    takerFee: number;
}

export interface BacktestSelectedPair {
    balance?: number;
    eid: string;
    makerFee: number;
    minFee?: number;
    name: string;
    remainingCurrency?: number;
    stock: string;
    takerFee: number;
}

export interface ArgOptimizeSetting {
    begin: number;
    end: number;
    step: number;
};

// worker backtest interfaces
export interface WorkerBacktestChartCfg {
    tooltip: {
        xDateFormat: string;
    },
    legend: {
        enabled: boolean;
    },
    plotOptions: {
        candlestick: {
            color: string;
            upColor: string;
        }
    },
    rangeSelector: {
        buttons: [{
            type: string;
            count: number;
            text: string;
        }, {
                type: string;
                count: number;
                text: string;
            }, {
                type: string;
                count: number;
                text: string;
            }, {
                type: string;
                text: string;
            }],
        selected: number;
        inputEnabled: boolean;
    },
    series: [{
        type: string;
        name: string;
        id: string;
        data: any[];
    }, {
            type: string;
            yAxis: number;
            showInLegend: boolean;
            name: string;
            data: any[];
            tooltip: {
                valueDecimals: number;
            }
        }, {
            type: string;
            yAxis: number;
            showInLegend: boolean;
            name: string;
            data: any[];
            tooltip: {
                valueDecimals: number;
            }
        }, {
            type: string;
            yAxis: number;
            showInLegend: boolean;
            name: string;
            data: any[];
            tooltip: {
                valueDecimals: number;
            }
        }],
    yAxis: [{
        title: {
            text: string;
        },
        style: {
            color: string;
        },
        opposite: boolean;
    }, {
            title: {
                text: string;
            },
            opposite: boolean;
        }],
    __isStock: boolean;
}

export interface WorkerBacktestChart extends BacktestResultChart {
}

export interface WorkerBacktestSnapshot extends BacktestResultSnapshot {
}

export type WorkerBacktestRequest = [BacktestPutTaskParams, WorkerBacktestHttpCache, string];

export interface WorkerBacktest {
    task: BacktestPutTaskParams;
    uri: string;
    blob: string;
}

export interface WorkerBacktestHttpCache {
    [key: string]: any;
}

export interface WorkerBacktestResponse extends BacktestResult {
    Accounts?: Object
    Chart: WorkerBacktestChart;
    CloseProfitLogs?: any[];
    Elapsed: number;
    Exception: string;
    Finished: boolean;
    LoadBytes: number;
    LoadElapsed: number;
    LogsCount: number;
    Pending?: any;
    Profit: number;
    ProfitLogs: any[];
    Progress: number;
    // Snapshorts: [number, WorkerBacktestSnapshot[]][];
    Status: string;
    Stderr: string;
    Symbols: any[];
    // Task: BacktestPutTaskParams;
    TaskStatus: number;
    Time: number;
    httpCache?: WorkerBacktestHttpCache;
}

// args related interfaces
export interface OptimizedVariableOverview extends VariableOverview {
    isOptimizing?: boolean;
    optimize?: ArgOptimizeSetting;
    toBeTestedValues?: number[]; // 调优的参数中将要被测试的值
}

export interface BacktestTaskDescription {
    file: string;
    variableName: string;
    variableDes: string;
    variableValue: number;
}

export interface BacktestCode {
    name: string;
    args: Array<OptimizedVariableOverview & VariableOverview>;
    id: number;
}

export interface BacktestLogResult {
    elapsed: number;
    profit: number;
    tradeCount: number;
    winningRate: number;
    maxDrawdown: number;
    sharpeRatio: number;
    returns: number;
}

export interface BacktestAccount {
    name: string;
    quoteCurrency: string; // 定价货币
    baseCurrency: string; // 交易品种
    commission: number; // 手续费
    positionProfit?: number; // 持仓盈亏
    currentMargin?: number; // 保证金
    returns: number; // 预估收益
    isFutures: boolean;
    isFuturesOkCoin: boolean;
    symbol: string;
    initialBalance?: number;
    initialStocks: number;
    // profitAndLose: BacktestProfitDescription[]; 知道干什么用的时候求，预感这里写上耦合了。
}

export interface BacktestProfitDescription {
    time: number;
    profit: number;
}

export interface BacktestOrderLog {
    x: number;
    title: string;
    text: string;
    shape?: string;
    color?: string;
}

export interface BacktestOrderLogs {
    [key: string]: BacktestOrderLog[];
}
