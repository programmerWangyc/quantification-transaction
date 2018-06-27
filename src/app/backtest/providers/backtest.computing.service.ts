import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { ArgOptimizeSetting, WorkerBacktest, WorkerBacktestRequest } from '../backtest.interface';

export interface OptimizeArg {
    file: string; // 模板名称
    argName: string;
    argDesc: string;
    setting: ArgOptimizeSetting;
}

export interface OptimizedArg {
    id: number;
    profit: number;
    elapsed: number;
    sharpeRatio: number;
    maxDrawdown: number;
    returns: number;
    winningRate: number;
    tradeCount: number;
    closeProfit: number;
    progress: number;
    settings: any[];
    running: boolean;
    finished: boolean;
}
/**
 * TODO: 本地回测时的服务， 和webWorker进行交互的行为应该全部都在这个服务中。
 */
@Injectable()
export class BacktestComputingService {

    constructor() { }

    handleBacktestInWorker(data: Observable<WorkerBacktest>): Subscription {
        return data.subscribe(({ task, blob, uri }) => {

            // bootstrapWorkerUi('worker.bundle.js');
            const worker = new Worker(uri);

            const params: WorkerBacktestRequest = [task, null, blob]; // TODO: httpCache

            console.log(params, uri);
        });
    }
}
