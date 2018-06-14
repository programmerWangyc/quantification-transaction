import { Injectable } from '@angular/core';
import * as moment from 'moment';

import { CategoryType } from '../../interfaces/request.interface';
import { ConstantService } from '../../providers/constant.service';

export interface BacktestPeriodConfig {
    max: string;
    min: string;
    start: string;
    end: string;
}

export interface BacktestMode {
    id: number;
    name: string;
}

export interface AdvancedOptionConfig {
    name: string;
    value: number;
    max: number;
    min: number;
    storageKey: string; // corresponding to the key of AdvancedOption interface that defined in backtest.constant.service.ts;
    tip: string;
    step: number;
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

export interface CompareOperator {
    name: string;
    id: number;
}

export const BACKTEST_MODES: BacktestMode[] = [
    { id: 0, name: 'SIMULATION_LEVEL_TICK' },
    { id: 1, name: 'REAL_LEVEL_TICK' }
];

export const ADVANCED_OPTIONS_CONFIG: AdvancedOptionConfig[] = [
    { name: 'LOG', value: NaN, max: 8000, min: 0, storageKey: 'log', tip: 'BACKTEST_LOG_OPTION_TIP', step: 500 },
    { name: 'PROFIT', value: NaN, max: 8000, min: 0, storageKey: 'profit', tip: 'BACKTEST_PROFIT_OPTION_TIP', step: 500 },
    { name: 'CHART', value: NaN, max: 5000, min: 0, storageKey: 'chart', tip: 'BACKTEST_CHART_OPTION_TIP', step: 500 },
    { name: 'SLIP_POINT', value: NaN, max: Infinity, min: 0, storageKey: 'slipPoint', tip: 'BACKTEST_SLIP_POINT_OPTION_TIP', step: 1 },
    { name: 'DELAY', value: NaN, max: 10000, min: 1, storageKey: 'delay', tip: 'BACKTEST_DELAY_OPTION_TIP', step: 100 },
    { name: 'FAULT_TOLERANT', value: NaN, max: 1, min: 0, storageKey: 'faultTolerant', tip: 'BACKTEST_FAULT_TOLERANT_OPTION_TIP', step: 0.1 },
    { name: 'COLUMN_LENGTH', value: NaN, max: 1500, min: 1, storageKey: 'barLen', tip: 'BACKTEST_BAR_LEN_OPTION_TIP', step: 100 },
];


export const BACKTEST_PLATFORMS: BacktestPlatform[] = [
    { eid: 'OKCoin_EN', name: 'OKCOINEN', stocks: ['BTC', 'LTC', 'ETH', 'ETC', 'BCH'], quoteCurrency: 'USD', balance: 10000, remainingCurrency: 3, makerFee: 0.15, takerFee: 0.2, group: 'DIGITAL_CURRENCY' },
    { eid: 'Bitfinex', name: 'Bitfinex', stocks: ['BTC', 'LTC', 'ETH', 'ETC', 'BCH'], quoteCurrency: 'USD', balance: 10000, remainingCurrency: 3, makerFee: 0.2, takerFee: 0.2, group: 'DIGITAL_CURRENCY' },
    { eid: 'OKEX', name: 'OKEX', stocks: ['LTC_BTC', 'ETH_BTC', 'ETC_BTC', 'BCH_BTC'], quoteCurrency: 'BTC', balance: 3, remainingCurrency: 10, makerFee: 0.15, takerFee: 0.2, group: 'DIGITAL_CURRENCY' },
    { eid: 'Huobi', name: 'HUOBI', stocks: ['LTC_BTC', 'ETH_BTC', 'ETC_BTC', 'BCH_BTC'], quoteCurrency: 'BTC', balance: 3, remainingCurrency: 10, makerFee: 0.15, takerFee: 0.2, group: 'DIGITAL_CURRENCY' },
    { eid: 'Futures_OKCoin', name: 'OKCOIN', stocks: ['BTC', 'LTC', 'ETH', 'ETC', 'BCH'], quoteCurrency: 'USD', balance: 0, remainingCurrency: 3, makerFee: 0.03, takerFee: 0.03, group: 'DIGITAL_CURRENCY' },
    { eid: 'Futures_CTP', name: 'FUTURES_CTP', stocks: ['FUTURES'], quoteCurrency: 'CNY', balance: 1000000, remainingCurrency: 0, makerFee: 0.025, takerFee: 0.025, group: 'FUTURES_SECURITY' },
];

export enum CompareLogic {
    MORE_THAN,
    LESS_THAN,
    EQUAL
}

export const COMPARE_OPERATORS: CompareOperator[] = [
    { name: 'MORE_THAN', id: CompareLogic.MORE_THAN },
    { name: 'LESS_THAN', id: CompareLogic.LESS_THAN },
    { name: 'EQUAL', id: CompareLogic.EQUAL },
];

@Injectable()
export class BacktestConstantService extends ConstantService {

    MIN_DATE = '2015-02-22 00:00:00';

    MIN_DATE2 = '2010-01-11 09:00:00';

    BACKTEST_MODES = BACKTEST_MODES;

    ADVANCED_OPTIONS_CONFIG = ADVANCED_OPTIONS_CONFIG;

    BACKTEST_PLATFORMS = BACKTEST_PLATFORMS;

    COMPARE_OPERATORS = COMPARE_OPERATORS;

    constructor() {
        super();
    }

    getBackTestPeriodTimeConfig(category: number): BacktestPeriodConfig {

        /**
         * @description The 'subtract' method would be modify the origin data, it is not a pure function.
         */
        const now = moment();

        const today = moment().format('YYYY-MM-DD HH:00:00');

        if (category !== CategoryType.STOCK_SECURITY && category !== CategoryType.COMMODITY_FUTURES) {
            const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD 00:00:00');

            return { max: today, min: this.MIN_DATE, start: yesterday, end: today }
        } else {
            const days = category === CategoryType.COMMODITY_FUTURES ? 7 : 365;

            const yesterday15Clock = now.subtract(1, 'days').format('YYYY-MM-DD 15:00:00');

            return { max: yesterday15Clock, min: this.MIN_DATE2, start: now.subtract(days, 'days').format('YYYY-MM-DD 09:00:00'), end: yesterday15Clock };
        }
    }

}
