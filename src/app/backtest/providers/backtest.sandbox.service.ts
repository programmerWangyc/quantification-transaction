import { Injectable } from '@angular/core';

import { isUndefined } from 'lodash';

export interface SymbolRecord {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

/**
 * @ignore
 */
@Injectable()
export class BacktestSandboxService {

    constructor() { }

    ArrToXY(openHighLowClose: number[][], arr: number[][] | number[], skipMS?: number): [number, number][] {
        const data = [];

        if (arr.length === 0) return data;

        if (Array.isArray(arr[0])) {
            for (let i = 0; i < arr.length; i++) {
                data[i] = [];
                for (let j = 0; j < (<number[]>arr[i]).length; j++) {
                    if (!isNaN(arr[i][j])) {
                        if (isUndefined(openHighLowClose[j])) {
                            data[i].push([openHighLowClose[openHighLowClose.length - 1][0] + ((j - openHighLowClose.length + 1) * skipMS), arr[i][j]]);
                        } else {
                            data[i].push([openHighLowClose[j][0], arr[i][j]]);
                        }
                    }
                }
            }
        } else {
            for (let i = 0; i < arr.length; i++) {
                if (!isNaN(<number>arr[i])) {
                    data.push([openHighLowClose[i][0], arr[i]]);
                }
            }
        }

        return data;
    }

    _skip(arr: number[], period: number): number {
        let j = 0;
        for (let k = 0; j < arr.length; j++) {
            if (!isNaN(arr[j])) k++;
            if (k === period) break;
        }
        return j;
    }

    _sum(arr: number[], num: number): number {
        let sum = 0.0;

        for (let i = 0; i < num; i++) {
            if (!isNaN(arr[i])) {
                sum += arr[i];
            }
        }

        return sum;
    }

    _avg(arr: number[], num: number): number {
        let n = 0;
        let sum = 0.0;
        for (let i = 0; i < num; i++) {
            if (!isNaN(arr[i])) {
                sum += arr[i];
                n++;
            }
        }
        return sum / n;
    }

    _zeros(len: number): number[] {
        const result = new Array(len);

        return result.fill(0.0);
    }

    private _set(arr: number[], start: number, end: number, value: number): void {
        const e = Math.min(arr.length, end);
        for (let i = start; i < e; i++) {
            arr[i] = value;
        }
    }

    _diff(a: number[], b: number[]): number[] {
        const d = [];
        for (let i = 0; i < b.length; i++) {
            if (isNaN(a[i]) || isNaN(b[i])) {
                d.push(NaN);
            } else {
                d.push(a[i] - b[i]);
            }
        }
        return d;
    }

    _move_diff(a: number[]): number[] {
        const d = [];
        for (let i = 1; i < a.length; i++) {
            d.push(a[i] - a[i - 1]);
        }
        return d;
    }

    _sma(S: number[], period: number): number[] {
        const R = this._zeros(S.length);
        const j = this._skip(S, period);
        this._set(R, 0, j, NaN);
        if (j < S.length) {
            let sum = 0;
            for (let i = j; i < S.length; i++) {
                if (i === j) {
                    sum = this._sum(S, i + 1);
                } else {
                    sum += S[i] - S[i - period];
                }
                R[i] = sum / period;
            }
        }
        return R;
    }

    _smma(S: number[], period: number): number[] {
        const R = this._zeros(S.length);
        const j = this._skip(S, period);
        this._set(R, 0, j, NaN);
        if (j < S.length) {
            R[j] = this._avg(S, j + 1);
            for (let i = j + 1; i < S.length; i++) {
                R[i] = (R[i - 1] * (period - 1) + S[i]) / period;
            }
        }
        return R;
    }

    _ema(source: number[], period: number): number[] {
        const result = this._zeros(source.length);
        const multiplier = 2.0 / (period + 1);
        const j = this._skip(source, period);
        this._set(result, 0, j, NaN);
        if (j < source.length) {
            result[j] = this._avg(source, j + 1);
            for (let i = j + 1; i < source.length; i++) {
                result[i] = ((source[i] - result[i - 1]) * multiplier) + result[i - 1];
            }
        }
        return result;
    }

    _cmp(arr, start, end, cmpFunc) {
        let v = arr[start];
        for (let i = start; i < end; i++) {
            v = cmpFunc(arr[i], v);
        }
        return v;
    }

    _filt(records, n, attr, iv, cmpFunc) {
        if (records.length < 2) {
            return NaN;
        }
        let v = iv;
        const pos = n !== 0 ? records.length - Math.min(records.length - 1, n) - 1 : 0;
        for (let i = records.length - 2; i >= pos; i--) {
            if (typeof (attr) !== 'undefined') {
                v = cmpFunc(v, records[i][attr]);
            } else {
                v = cmpFunc(v, records[i]);
            }
        }
        return v;
    }

    _ticks(records: SymbolRecord[]): number[] | SymbolRecord[] {
        if (records.length === 0) {
            return [];
        }

        if (records[0].close) {
            return records.map(record => record.close);
        } else {
            return records;
        }
    }

    Highest(records, n, attr) {
        return this._filt(records, n, attr, Number.MIN_VALUE, Math.max);
    }

    Lowest(records, n, attr) {
        return this._filt(records, n, attr, Number.MAX_VALUE, Math.min);
    }

    MA(records, period) {
        period = typeof (period) === 'undefined' ? 9 : period;
        return this._sma(this._ticks(records) as number[], period);
    }

    SMA(records: SymbolRecord[], period) {
        period = typeof (period) === 'undefined' ? 9 : period;
        return this._sma(this._ticks(records) as number[], period);
    }

    EMA(records, period) {
        period = typeof (period) === 'undefined' ? 9 : period;
        return this._ema(this._ticks(records) as number[], period);
    }

    MACD(records: SymbolRecord[], fastEMA = 12, slowEMA = 26, signalEMA = 9): number[][] {
        const ticks = <number[]>this._ticks(records);
        const slow = this._ema(ticks, slowEMA);
        const fast = this._ema(ticks, fastEMA);
        // DIF
        const dif = this._diff(fast, slow);
        // DEA
        const signal = this._ema(dif, signalEMA);
        const histogram = this._diff(dif, signal);
        return [dif, signal, histogram];
    }

    BOLL(records, period, multiplier) {
        period = typeof (period) === 'undefined' ? 20 : period;
        multiplier = typeof (multiplier) === 'undefined' ? 2 : multiplier;
        const S = <number[]>this._ticks(records);
        // tslint:disable-next-line:no-var-keyword
        for (var j = period - 1; j < S.length && isNaN(S[j]); j++);
        const UP = this._zeros(S.length);
        const MB = this._zeros(S.length);
        const DN = this._zeros(S.length);
        this._set(UP, 0, j, NaN);
        this._set(MB, 0, j, NaN);
        this._set(DN, 0, j, NaN);
        let sum = 0;
        for (let i = j; i < S.length; i++) {
            if (i === j) {
                for (let k = 0; k < period; k++) {
                    sum += S[k];
                }
            } else {
                sum = sum + S[i] - S[i - period];
            }
            const ma = sum / period;
            let d = 0;
            for (let k = i + 1 - period; k <= i; k++) {
                d += (S[k] - ma) * (S[k] - ma);
            }
            const stdev = Math.sqrt(d / period);
            const up = ma + (multiplier * stdev);
            const dn = ma - (multiplier * stdev);
            UP[i] = up;
            MB[i] = ma;
            DN[i] = dn;
        }
        // upper, middle, lower
        return [UP, MB, DN];
    }

    KDJ(records: SymbolRecord[], n = 9, k = 3, d = 3): number[][] {
        const length = records.length;
        const RSV = this._zeros(length);
        this._set(RSV, 0, n - 1, NaN);
        const K = this._zeros(length);
        const D = this._zeros(length);
        const J = this._zeros(length);

        const hs = this._zeros(length);
        const ls = this._zeros(length);
        for (let i = 0; i < records.length; i++) {
            hs[i] = records[i].high;
            ls[i] = records[i].low;
        }

        for (let i = 0; i < length; i++) {
            if (i >= (n - 1)) {
                const c = records[i].high;
                const h = this._cmp(hs, i - (n - 1), i + 1, Math.max);
                const l = this._cmp(ls, i - (n - 1), i + 1, Math.min);
                RSV[i] = h !== l ? (100 * ((c - l) / (h - l))) : 100;
                K[i] = (1 * RSV[i] + (k - 1) * K[i - 1]) / k;
                D[i] = (1 * K[i] + (d - 1) * D[i - 1]) / d;
            } else {
                K[i] = D[i] = 50;
                RSV[i] = 0;
            }
            J[i] = 3 * K[i] - 2 * D[i];
        }
        // remove prefix
        for (let i = 0; i < n - 1; i++) {
            K[i] = D[i] = J[i] = NaN;
        }
        return [K, D, J];
    }

    RSI(records: SymbolRecord[], period = 14): number[] {
        let i;
        const n = period;
        const rsi = this._zeros(records.length);
        this._set(rsi, 0, rsi.length, NaN);
        if (records.length < n) {
            return rsi;
        }
        const ticks = <number[]>this._ticks(records);
        const deltas = this._move_diff(ticks);
        const seed = deltas.slice(0, n);
        let up = 0;
        let down = 0;
        for (i = 0; i < seed.length; i++) {
            if (seed[i] >= 0) {
                up += seed[i];
            } else {
                down += seed[i];
            }
        }
        up /= n;
        down = -(down /= n);
        let rs = down !== 0 ? up / down : 0;
        rsi[n] = 100 - 100 / (1 + rs);
        let delta = 0;
        let upval = 0;
        let downval = 0;
        for (i = n + 1; i < ticks.length; i++) {
            delta = deltas[i - 1];
            if (delta > 0) {
                upval = delta;
                downval = 0;
            } else {
                upval = 0;
                downval = -delta;
            }
            up = (up * (n - 1) + upval) / n;
            down = (down * (n - 1) + downval) / n;
            rs = up / down;
            rsi[i] = 100 - 100 / (1 + rs);
        }
        return rsi;
    }

    OBV(records: SymbolRecord[]): number[] {
        if (records.length === 0) return [];

        if (isUndefined(records[0].close)) throw new Error('argument must KLine');

        const volumes = [];

        for (let i = 0; i < records.length; i++) {
            if (i === 0) {
                volumes[i] = records[i].volume;
            } else if (records[i].close >= records[i - 1].close) {
                volumes[i] = volumes[i - 1] + records[i].volume;
            } else {
                volumes[i] = volumes[i - 1] - records[i].volume;
            }
        }

        return volumes;
    }

    ATR(records, period) {
        if (records.length === 0) {
            return [];
        }
        if (typeof (records[0].high) === 'undefined') {
            throw new Error('argument must KLine');
        }
        period = typeof (period) === 'undefined' ? 14 : period;
        const R = this._zeros(records.length);
        let sum = 0;
        let n = 0;
        for (let i = 0; i < records.length; i++) {
            let TR = 0;
            if (i === 0) {
                TR = records[i].high - records[i].low;
            } else {
                TR = Math.max(records[i].high - records[i].low, Math.abs(records[i].high - records[i - 1].close), Math.abs(records[i - 1].close - records[i].low));
            }
            sum += TR;
            if (i < period) {
                n = sum / (i + 1);
            } else {
                n = (((period - 1) * n) + TR) / period;
            }
            R[i] = n;
        }
        return R;
    }

    Alligator(records: SymbolRecord[], jawLength = 13, teethLength = 8, lipsLength = 5) {
        // http://www.myeatrade.com/zh/277/
        const ticks = records.map(record => (record.high + record.low) / 2);

        return [
            [NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN].concat(this._smma(ticks, jawLength)), // jaw (blue)
            [NaN, NaN, NaN, NaN, NaN].concat(this._smma(ticks, teethLength)), // teeth (red)
            [NaN, NaN, NaN].concat(this._smma(ticks, lipsLength)), // lips (green)
        ];
    }

    CMF(records, periods) {
        periods = periods || 20;
        const ret = [];
        let sumD = 0;
        let sumV = 0;
        const arrD = [];
        const arrV = [];
        for (let i = 0; i < records.length; i++) {
            const d = (records[i].high === records[i].low) ? 0 : (2 * records[i].high - records[i].low - records[i].high) / (records[i].high - records[i].low) * records[i].Volume;
            arrD.push(d);
            arrV.push(records[i].Volume);
            sumD += d;
            sumV += records[i].Volume;
            if (i >= periods) {
                sumD -= arrD.shift();
                sumV -= arrV.shift();
            }
            ret.push(sumD / sumV);
        }
        return ret;
    }
}
