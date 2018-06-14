import { LocalStorageKey } from '../../app.config';
import { K_LINE_PERIOD } from '../../providers/constant.service';
import * as actions from './backtest.action';

export interface AdvancedOption {
    log: number;
    profit: number;
    chart: number;
    slipPoint: number;
    delay: number;
    faultTolerant: number;
    barLen: number;
}

const storedAdvancedOptions = JSON.parse(localStorage.getItem(LocalStorageKey.backtestAdvancedOptions));

export interface UIState {
    selectedKlinePeriod: number;
    advancedOptions: AdvancedOption;
    floorKlinePeriod: number;
}

export const defaultAdvancedOptions: AdvancedOption = { log: 8000, profit: 8000, chart: 3000, slipPoint: 0, delay: 200, faultTolerant: 0.5, barLen: 300 };

export const initialStateUIState: UIState = {
    selectedKlinePeriod: K_LINE_PERIOD.find(item => item.minutes === 15).id,
    advancedOptions: storedAdvancedOptions || defaultAdvancedOptions,
    floorKlinePeriod: K_LINE_PERIOD.find(item => item.minutes === 5).id,
}

export interface State {
    UIState: UIState;
}

const initialState: State = {
    UIState: initialStateUIState
}

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {

        case actions.UPDATE_SELECTED_KLINE_PERIOD:
            return { ...state, UIState: { ...state.UIState, selectedKlinePeriod: action.payload } };

        case actions.UPDATE_FLOOR_KLINE_PERIOD:
            return { ...state, UIState: { ...state.UIState, floorKlinePeriod: action.payload } };

        case actions.UPDATE_BACKTEST_ADVANCED_OPTION: {
            const advancedOptions = { ...state.UIState.advancedOptions, ...action.payload };

            localStorage.setItem(LocalStorageKey.backtestAdvancedOptions, JSON.stringify(advancedOptions));

            return { ...state, UIState: { ...state.UIState, advancedOptions } };
        }

        default:
            return state;
    }
}

export const getUIState = (state: State) => state.UIState;
