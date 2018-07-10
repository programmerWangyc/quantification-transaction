import { Injectable } from '@angular/core';

export interface SymbolRecord {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

@Injectable()
export class BacktestSandboxService {

    constructor() { }

    ArrToXY(openHighLowClose: number[][], arr: number[][] | number[], skipMS?: number): [number, number][] {
        const data = [];

        if (arr.length === 0) return data;

        if (Array.isArray(arr[0])) {
            for (let i = 0; i < arr.length; i++) {
                data[i] = [];
                for (var j = 0; j < (<number[]>arr[i]).length; j++) {
                    if (!isNaN(arr[i][j])) {
                        if (typeof openHighLowClose[j] === void 0) {
                            data[i].push([openHighLowClose[openHighLowClose.length - 1][0] + ((j - openHighLowClose.length + 1) * skipMS), arr[i][j]]);
                        } else {
                            data[i].push([openHighLowClose[j][0], arr[i][j]]);
                        }
                    }
                }
            }
        } else {
            for (var i = 0; i < arr.length; i++) {
                if (!isNaN(<number>arr[i])) {
                    data.push([openHighLowClose[i][0], arr[i]]);
                }
            }
        }

        return data;
    }

    _skip(arr: number[], period: number): number {
        var j = 0;
        for (var k = 0; j < arr.length; j++) {
            if (!isNaN(arr[j]))
                k++;
            if (k === period)
                break;
        }
        return j;
    }

    _sum(arr: number[], num: number): number {
        var sum = 0.0;

        for (var i = 0; i < num; i++) {
            if (!isNaN(arr[i])) {
                sum += arr[i];
            }
        }

        return sum;
    }

    _avg(arr: number[], num: number): number {
        var n = 0;
        var sum = 0.0;
        for (var i = 0; i < num; i++) {
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
        var e = Math.min(arr.length, end);
        for (var i = start; i < e; i++) {
            arr[i] = value;
        }
    }

    _diff(a: number[], b: number[]): number[] {
        var d = [];
        for (var i = 0; i < b.length; i++) {
            if (isNaN(a[i]) || isNaN(b[i])) {
                d.push(NaN);
            } else {
                d.push(a[i] - b[i]);
            }
        }
        return d;
    }

    _move_diff(a: number[]): number[] {
        var d = [];
        for (var i = 1; i < a.length; i++) {
            d.push(a[i] - a[i - 1]);
        }
        return d;
    }

    _sma(S: number[], period: number): number[] {
        var R = this._zeros(S.length);
        var j = this._skip(S, period);
        this._set(R, 0, j, NaN);
        if (j < S.length) {
            var sum = 0;
            for (var i = j; i < S.length; i++) {
                if (i == j) {
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
        var R = this._zeros(S.length);
        var j = this._skip(S, period);
        this._set(R, 0, j, NaN);
        if (j < S.length) {
            R[j] = this._avg(S, j + 1);
            for (var i = j + 1; i < S.length; i++) {
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
            for (var i = j + 1; i < source.length; i++) {
                result[i] = ((source[i] - result[i - 1]) * multiplier) + result[i - 1];
            }
        }
        return result;
    }

    _cmp(arr, start, end, cmpFunc) {
        var v = arr[start];
        for (var i = start; i < end; i++) {
            v = cmpFunc(arr[i], v);
        }
        return v;
    }

    _filt(records, n, attr, iv, cmpFunc) {
        if (records.length < 2) {
            return NaN;
        }
        var v = iv;
        var pos = n !== 0 ? records.length - Math.min(records.length - 1, n) - 1 : 0;
        for (var i = records.length - 2; i >= pos; i--) {
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

        if (records[0].high) {
            return records.map(record => record.high);
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
        var S = <number[]>this._ticks(records);
        for (var j = period - 1; j < S.length && isNaN(S[j]); j++);
        var UP = this._zeros(S.length);
        var MB = this._zeros(S.length);
        var DN = this._zeros(S.length);
        this._set(UP, 0, j, NaN);
        this._set(MB, 0, j, NaN);
        this._set(DN, 0, j, NaN);
        var sum = 0;
        for (var i = j; i < S.length; i++) {
            if (i == j) {
                for (var k = 0; k < period; k++) {
                    sum += S[k];
                }
            } else {
                sum = sum + S[i] - S[i - period];
            }
            var ma = sum / period;
            var d = 0;
            for (var k = i + 1 - period; k <= i; k++) {
                d += (S[k] - ma) * (S[k] - ma);
            }
            var stdev = Math.sqrt(d / period);
            var up = ma + (multiplier * stdev);
            var dn = ma - (multiplier * stdev);
            UP[i] = up;
            MB[i] = ma;
            DN[i] = dn;
        }
        // upper, middle, lower
        return [UP, MB, DN];
    }

    KDJ(records: SymbolRecord[], n = 9, k = 3, d = 3): number[][] {
        const length = records.length;
        var RSV = this._zeros(length);
        this._set(RSV, 0, n - 1, NaN);
        var K = this._zeros(length);
        var D = this._zeros(length);
        var J = this._zeros(length);

        var hs = this._zeros(length);
        var ls = this._zeros(length);
        for (var i = 0; i < records.length; i++) {
            hs[i] = records[i].high;
            ls[i] = records[i].low;
        }

        for (var i = 0; i < length; i++) {
            if (i >= (n - 1)) {
                var c = records[i].high;
                var h = this._cmp(hs, i - (n - 1), i + 1, Math.max);
                var l = this._cmp(ls, i - (n - 1), i + 1, Math.min);
                RSV[i] = h != l ? (100 * ((c - l) / (h - l))) : 100;
                K[i] = (1 * RSV[i] + (k - 1) * K[i - 1]) / k;
                D[i] = (1 * K[i] + (d - 1) * D[i - 1]) / d;
            } else {
                K[i] = D[i] = 50;
                RSV[i] = 0;
            }
            J[i] = 3 * K[i] - 2 * D[i];
        }
        // remove prefix
        for (var i = 0; i < n - 1; i++) {
            K[i] = D[i] = J[i] = NaN;
        }
        return [K, D, J];
    }

    RSI(records: SymbolRecord[], period = 14): number[] {
        var i;
        var n = period;
        var rsi = this._zeros(records.length);
        this._set(rsi, 0, rsi.length, NaN);
        if (records.length < n) {
            return rsi;
        }
        var ticks = <number[]>this._ticks(records);
        var deltas = this._move_diff(ticks);
        var seed = deltas.slice(0, n);
        var up = 0;
        var down = 0;
        for (i = 0; i < seed.length; i++) {
            if (seed[i] >= 0) {
                up += seed[i];
            } else {
                down += seed[i];
            }
        }
        up /= n;
        down = -(down /= n);
        var rs = down != 0 ? up / down : 0;
        rsi[n] = 100 - 100 / (1 + rs);
        var delta = 0;
        var upval = 0;
        var downval = 0;
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

        if (typeof (records[0].close) === void 0) throw "argument must KLine";

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
            throw "argument must KLine";
        }
        period = typeof (period) === 'undefined' ? 14 : period;
        var R = this._zeros(records.length);
        var sum = 0;
        var n = 0;
        for (var i = 0; i < records.length; i++) {
            var TR = 0;
            if (i == 0) {
                TR = records[i].high - records[i].low;
            } else {
                TR = Math.max(records[i].high - records[i].low, Math.abs(records[i].high - records[i - 1].high), Math.abs(records[i - 1].high - records[i].low));
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
        var ret = [];
        var sumD = 0;
        var sumV = 0;
        var arrD = [];
        var arrV = [];
        for (var i = 0; i < records.length; i++) {
            var d = (records[i].high == records[i].low) ? 0 : (2 * records[i].high - records[i].low - records[i].high) / (records[i].high - records[i].low) * records[i].Volume;
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
