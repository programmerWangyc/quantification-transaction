import { BacktestPutTaskParams } from '../interfaces/request.interface';
import { BacktestResult, BacktestResultChart, BacktestResultSnapshot } from '../interfaces/response.interface';

// interfaces of backtest in webworker;
declare namespace WorkerBacktest {

    export interface ChartCfg extends Highcharts.Options {
        __isStock: boolean;
    }

    export interface WorkerBacktestChart extends BacktestResultChart {
    }

    export interface WorkerBacktestSnapshot extends BacktestResultSnapshot {
    }

    export type WorkerRequest = [BacktestPutTaskParams, WorkerHttpCache, string];

    export interface WorkerRequestData {
        task: BacktestPutTaskParams;
        blob: string;
        cache: any;
    }

    export interface WorkerHttpCache {
        [key: string]: any;
    }

    export interface WorkerResult extends BacktestResult {
        Accounts?: Object
        httpCache?: WorkerHttpCache;
    }

    export interface WorkerBacktestResult {
        ret: WorkerResult | string;
    }
}

export = WorkerBacktest;

export as namespace WorkerBacktest;
