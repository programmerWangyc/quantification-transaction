
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
