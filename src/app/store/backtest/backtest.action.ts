import { Action } from '@ngrx/store';

/* ===========================================Api action=================================== */

/* ===========================================Local action=================================== */

export const UPDATE_SELECTED_KLINE_PERIOD = '[Backtest] UPDATE_SELECTED_KLINE_PERIOD';

export class UpdateSelectedKlinePeriodAction implements Action {
    readonly type = UPDATE_SELECTED_KLINE_PERIOD;

    constructor(public payload: number) { }
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

export type ApiActions = null;

export type Actions = ApiActions
    | UpdateSelectedKlinePeriodAction
    | UpdateFloorKlinePeriodAction
    | UpdateBacktestAdvancedOption

export const ResponseActions = {

}
