import { Injectable } from '@angular/core';
import * as moment from 'moment';

import { BacktestConstantOptions, CategoryType, BacktestPutTaskParams, BacktestPutTaskDescription, BacktestDescription } from '../../interfaces/request.interface';
import { ConstantService } from '../../providers/constant.service';
import { ArgOptimizeSetting, BacktestPlatform } from '../backtest.interface';

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
    storageKey: string; // corresponding to the key of AdvancedOption interface that defined in backtest.reducer.ts;
    tip: string;
    step: number;
}

export interface CompareOperator {
    name: string;
    id: number;
    operator: string;
}

export interface BacktestConstantConfig extends BacktestConstantOptions {
    eid: string;
}

/** =====================================================Constant======================================================== **/

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

export const BACKTEST_PLATFORMS_CONFIG: BacktestConstantConfig[] = [
    { eid: 'OKCoin_EN', DataSource: '', SymDots: 3, BasePrecision: 3, CurDots: 3, QuotePrecision: 3, Depth: 11, DepthDeep: 11, PriceTick: 0.01, FeeMin: 0, FeeDenominator: 5, },
    { eid: 'Bitfinex', DataSource: '', SymDots: 4, BasePrecision: 4, CurDots: 4, QuotePrecision: 4, Depth: 11, DepthDeep: 11, PriceTick: 0.001, FeeMin: 0, FeeDenominator: 5, },
    { eid: 'OKEX', DataSource: '', SymDots: 4, BasePrecision: 4, CurDots: 8, QuotePrecision: 8, Depth: 11, DepthDeep: 11, PriceTick: 0.0000001, FeeMin: 0, FeeDenominator: 5, },
    { eid: 'Huobi', DataSource: '', SymDots: 4, BasePrecision: 4, CurDots: 8, QuotePrecision: 8, Depth: 11, DepthDeep: 11, PriceTick: 0.0000001, FeeMin: 0, FeeDenominator: 5, },
    { eid: 'Futures_OKCoin', DataSource: 'this_week', SymDots: 0, BasePrecision: 0, CurDots: 8, QuotePrecision: 8, Depth: 11, DepthDeep: 11, PriceTick: 0.0000001, FeeMin: 0, FeeDenominator: 5, },
    { eid: 'Futures_CTP', DataSource: 'CTP', SymDots: 0, BasePrecision: 0, CurDots: 3, QuotePrecision: 3, Depth: 2, DepthDeep: 2, PriceTick: 0.0000001, FeeMin: 0, FeeDenominator: 5, },
];

export enum CompareLogic {
    MORE_THAN,
    LESS_THAN,
    EQUAL
}

export const COMPARE_OPERATORS: CompareOperator[] = [
    { name: 'MORE_THAN', id: CompareLogic.MORE_THAN, operator: '>=' },
    { name: 'LESS_THAN', id: CompareLogic.LESS_THAN, operator: '<=' },
    { name: 'EQUAL', id: CompareLogic.EQUAL, operator: '===' },
];

export const MAIN_CODE_FLAG = 'main';

export const BACK_END_LANGUAGES: string[] = ['node', 'python | python2.7 | python3 | py', 'g++'];

@Injectable()
export class BacktestConstantService extends ConstantService {

    MIN_DATE = '2015-02-22 00:00:00';

    MIN_DATE2 = '2010-01-11 09:00:00';

    BACKTEST_MODES = BACKTEST_MODES;

    ADVANCED_OPTIONS_CONFIG = ADVANCED_OPTIONS_CONFIG;

    BACKTEST_PLATFORMS = BACKTEST_PLATFORMS;

    BACKTEST_PLATFORMS_CONFIG = BACKTEST_PLATFORMS_CONFIG;

    COMPARE_OPERATORS = COMPARE_OPERATORS;

    MAIN_CODE_FLAG = MAIN_CODE_FLAG;

    BT_STATUS = 1 << 0;

    BT_SYMBOLS = 1 << 1;

    BT_INDICATORS = 1 << 2;

    BT_CHART = 1 << 3;

    BT_PROFIT_LOGS = 1 << 4;

    BT_RUNTIME_LOGS = 1 << 5;

    BT_CLOSE_PROFIT_LOGS = 1 << 6;

    BT_ACCOUNTS = 1 << 7;

    BT_ACCOUNTS_PNL = 1 << 8;

    BACK_END_LANGUAGES = BACK_END_LANGUAGES;

    constructor() {
        super();
    }

    getOptimizeSetting(value: number): ArgOptimizeSetting {
        return value < 1 ? {
            begin: 0.1,
            end: 1.0,
            step: 0.1
        } : {
                begin: Math.max(1, Math.round(value * 0.5)),
                end: Math.max(2, Math.round(value * 1.5)),
                step: Math.max(1, Math.round(value * 0.1))
            };
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

    getRetFlags(): number {
        return this.BT_STATUS | this.BT_CHART | this.BT_PROFIT_LOGS | this.BT_RUNTIME_LOGS | this.BT_CLOSE_PROFIT_LOGS | this.BT_ACCOUNTS | this.BT_ACCOUNTS_PNL;
    }
}
