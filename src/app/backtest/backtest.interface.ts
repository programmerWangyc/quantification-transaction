import { VariableOverview } from '../interfaces/app.interface';
import { BacktestResultChartData } from '../interfaces/response.interface';

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
    profitAndLose?: BacktestProfitDescription[]; // 知道干什么用的时候求，预感这里写上耦合了。
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

export interface BacktestAssetsAndTime {
    yearDays: number;
    start: number;
    end: number;
    totalAssets: number;
}

export interface BacktestMaxDrawDownDescription {
    startDrawdownTime: number;
    maxDrawdown: number;
    maxAssets: number;
    maxAssetsTime: number;
    maxDrawdownTime: number;
}

export interface BacktestProfitChartSubtitleConfig {
    initialNetWorth: number;
    totalReturns: string;
    yearDays: number;
    annualizedReturns: string;
    volatility: number | string;
    sharpRatio: number | string;
    maxDrawdown: number | string;
    winningRate?: number;
    totalAssets: number;
}

export interface BacktestStrategyCharts {
    charts: Array<Highcharts.Options | Highstock.Options>;
    data: BacktestResultChartData[];
}
