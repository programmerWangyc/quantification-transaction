import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { BaseService } from '../../base/base.service';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import * as Actions from '../../store/backtest/backtest.action';
import { AdvancedOption, UIState } from '../../store/backtest/backtest.reducer';
import * as fromRoot from '../../store/index.reducer';
import { BacktestSelectedPair, TimeRange } from '../backtest.interface';
import { AdvancedOptionConfig } from './backtest.constant.service';

@Injectable()
export class BacktestService extends BaseService {

    constructor(
        private process: ProcessService,
        private error: ErrorService,
        private store: Store<fromRoot.AppState>,
    ) {
        super();
    }

    /* =======================================================Serve Request======================================================= */

    /* =======================================================Data acquisition======================================================= */

    private getUIState(): Observable<UIState> {
        return this.store.select(fromRoot.selectBacktestUIState);
    }

    getSelectedKlinePeriod(): Observable<number> {
        return this.getUIState().map(res => res.timeOptions.klinePeriodId);
    }

    getSelectedTimeRange(): Observable<TimeRange> {
        return this.getUIState().map(res => {
            const { start, end } = res.timeOptions;

            return { start, end }; // may be null;
        });
    }

    getAdvancedOptions(): Observable<AdvancedOption> {
        return this.getUIState().map(res => res.advancedOptions);
    }

    /* =======================================================Local state change======================================================= */

    updateSelectedTimeRange(range: TimeRange): void {
        this.store.dispatch(new Actions.UpdateSelectedTimeRangeAction(range));
    }

    updateSelectedKlinePeriod(id: number): void {
        this.store.dispatch(new Actions.UpdateSelectedKlinePeriodAction(id));
    }

    updateAdvancedOption(target: AdvancedOptionConfig): void {
        this.store.dispatch(new Actions.UpdateBacktestAdvancedOption({ [target.storageKey]: target.value }));
    }

    updateFloorKlinePeriod(id: number): void {
        this.store.dispatch(new Actions.UpdateFloorKlinePeriodAction(id));
    }

    updatePlatformOptions(source: BacktestSelectedPair[]): void {
        this.store.dispatch(new Actions.UpdateBacktestPlatformOptionAction(source));
    }

    /* =======================================================Shortcut methods======================================================= */

    /* =======================================================Error handler======================================================= */
}
