import { VariableOverview } from '../interfaces/app.interface';
import { BacktestExchange, BacktestPutTaskOptions, PutTaskCode, BacktestPutTaskParams } from '../interfaces/request.interface';

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

export interface WorkerBacktestChart {
    Cfg: string;
    Datas: any[];
}
export interface WorkerBacktestSnapshot {
    Balance: number;
    BaseCurrency: string;
    Commission: number;
    FrozenBalance: number;
    FrozenStocks: number;
    Id: string;
    QuoteCurrency: string;
    Stocks: number;
    Symbols: Object
    TradeStatus: Object;
}

export interface WorkerBacktestTask extends BacktestPutTaskParams { }

export type WorkerBacktestRequest = [WorkerBacktestTask, WorkerBacktestHttpCache, string];

export interface WorkerBacktest {
    task: BacktestPutTaskParams;
    uri: string;
    blob: string;
}

export interface WorkerBacktestHttpCache {
    [key: string]: any;
}

export interface WorkerBacktestResponse {
    Accounts: Object
    Chart: WorkerBacktestChart;
    Elapsed: number;
    Exception: string;
    Finished: boolean;
    Indicators: Object;
    LoadBytes: number;
    LoadElapsed: number;
    LogsCount: number;
    Pending?: any;
    Profit: number;
    ProfitLogs: any[];
    Progress: number;
    RuntimeLogs: Array<string | number>[]; // 每一个元素都是一个长度为10的数组
    Snapshorts: [number, WorkerBacktestSnapshot[]][];
    Status: string;
    Stderr: string;
    Symbols: any[];
    Task: WorkerBacktestTask;
    TaskStatus: number;
    Time: number;
    httpCache: WorkerBacktestHttpCache;
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
