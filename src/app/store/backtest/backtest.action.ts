import { Action } from '@ngrx/store';

import { BacktestSelectedPair, TimeRange } from '../../backtest/backtest.interface';

/* ===========================================Api action=================================== */

/* ===========================================Local action=================================== */

export const UPDATE_SELECTED_KLINE_PERIOD = '[Backtest] UPDATE_SELECTED_KLINE_PERIOD';

export class UpdateSelectedKlinePeriodAction implements Action {
    readonly type = UPDATE_SELECTED_KLINE_PERIOD;

    constructor(public payload: number) { }
}

export const UPDATE_SELECTED_TIME_RANGE = '[Backtest] UPDATE_SELECTED_TIME_RANGE';

export class UpdateSelectedTimeRangeAction implements Action {
    readonly type = UPDATE_SELECTED_TIME_RANGE;

    constructor(public payload: TimeRange) { }
}

export const UPDATE_FLOOR_KLINE_PERIOD = '[Backtest] UPDATE_FLOOR_KLINE_PERIOD';

export class UpdateFloorKlinePeriodAction implements Action {
    readonly type = UPDATE_FLOOR_KLINE_PERIOD;

    constructor(public payload: number) { }
}

export const UPDATE_BACKTEST_ADVANCED_OPTION = '[Backtest] UPDATE_BACKTEST_ADVANCED_OPTION';

export class UpdateBacktestAdvancedOption implements Action {
    readonly type = UPDATE_BACKTEST_ADVANCED_OPTION;

    constructor(public payload: { [key: string]: number }) { }
}

export const UPDATE_BACKTEST_PLATFORM_OPTION = '[Backtest] UPDATE_BACKTEST_PLATFORM_OPTION';

export class UpdateBacktestPlatformOptionAction implements Action {
    readonly type = UPDATE_BACKTEST_PLATFORM_OPTION;

    constructor(public payload: BacktestSelectedPair[]) { }
}

export type ApiActions = null;

export type Actions = ApiActions
    | UpdateSelectedKlinePeriodAction
    | UpdateFloorKlinePeriodAction
    | UpdateBacktestAdvancedOption
    | UpdateSelectedTimeRangeAction
    | UpdateBacktestPlatformOptionAction

export const ResponseActions = {

}
