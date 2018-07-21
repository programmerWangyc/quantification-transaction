import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { isNull, isString } from 'lodash';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { filter, map, mapTo, take } from 'rxjs/operators';

import { ErrorService } from '../../providers/error.service';
import { TipService } from '../../providers/tip.service';
import { TerminateWorkerBacktestAction } from '../../store/backtest/backtest.action';
import { AppState, selectIsAllBacktestTasksCompleted } from '../../store/index.reducer';
import { ArgOptimizeSetting } from '../backtest.interface';


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
 * 本地回测时的服务， 和webWorker进行交互的行为应该全部都在这个服务中。
 */
@Injectable()
export class BacktestComputingService {
    worker: Worker;

    private message: Subject<WorkerBacktest.WorkerResult | string>;

    private error$$: Subscription;

    private workerURI = '../../../assets/sandbox/worker_detours.js';

    constructor(
        private errorService: ErrorService,
        private store: Store<AppState>,
        private tip: TipService,
    ) {
    }

    /**
     * 开启webworker线程，同时监听webworker上的消息。
     */
    initWorker(): void {
        this.worker = new Worker(this.workerURI);

        this.worker.addEventListener('message', (event) => {
            const { ret } = <WorkerBacktest.WorkerBacktestResult>event.data;

            this.message.next(ret);

            this.store.pipe(
                select(selectIsAllBacktestTasksCompleted),
                filter(res => !isNull(res)),
                take(1)
            ).subscribe(isComplete => isComplete && this.clearWorker());
        });

        this.worker.addEventListener('error', (event) => {
            const errorFlags = ['TestEnd', 'OOH', 'history', 'Unexpected token'];

            const { message } = event;

            this.errorService.handleError(
                of(errorFlags.some(flag => message.includes(flag)) ? 'BACKTEST_HISTORY_INFO_EMPTY' : message)
            );

            this.clearWorker();
        });
    }

    /**
     * 在webworker中运行回测。
     */
    run(data: WorkerBacktest.WorkerRequestData): Observable<WorkerBacktest.WorkerResult> {
        if (!this.worker) {
            this.initWorker();
        }

        if (this.error$$) {
            this.error$$.unsubscribe();
            this.message = null;
        }

        this.message = new Subject();

        this.error$$ = this.handleWorkerError();

        const { task, blob, cache } = data;

        this.worker.postMessage([task, cache, blob]);

        return this.message.asObservable().pipe(
            filter(res => !isString(res))
        ) as Observable<WorkerBacktest.WorkerResult>;
    }

    /**
     * Terminate worker backtesting;
     */
    stopRun(command: Observable<any>): Subscription {
        return command.subscribe(_ => {
            this.clearWorker();

            this.store.dispatch(new TerminateWorkerBacktestAction());

            this.tip.messageInfo('BACKTESTING_TERMINATED');
        });
    }

    /**
     * Terminate webworker thread while unsubscribe error message if subscribed;
     */
    private clearWorker(): void {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }

        this.error$$ && this.error$$.unsubscribe();
    }

    /**
     * 回测任务是否失败
     */
    private isBacktestFail(): Observable<boolean> {
        return this.message.asObservable().pipe(
            map(res => isString(res))
        );
    }

    /**
     * @ignore
     */
    private handleWorkerError(): Subscription {
        return this.errorService.handleError(
            this.isBacktestFail().pipe(
                filter(res => res),
                mapTo('BACKTEST_HISTORY_INFO_EMPTY')
            )
        );
    }

}
