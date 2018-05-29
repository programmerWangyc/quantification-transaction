import { PublicResponse, ResponseState, SettingsResponse } from '../../interfaces/response.interface';
import { LocalStorageKey, Referrer } from './../../interfaces/constant.interface';
import { SettingsRequest } from './../../interfaces/request.interface';
import * as actions from './public.action';

export interface Settings {
    agreement: string;
    about: string;
    api: string;
    promotion: {}
    docker: {}
    brokers: {}
    index: {}
}

export interface State extends PublicResponse {
    referrer: Referrer;
    settings: Settings;
    settingsResponse: ResponseState;
    settingsRequest: SettingsRequest;
    language: string;
    needFooter: boolean;
}

export const initialState: State = {
    balance: null,
    cached: null,
    callbackId: null,
    consumed: null,
    error: null,
    is_admin: null,
    notify: null,
    token: null,
    username: null,
    version: null,
    referrer: null,
    settings: null,
    settingsRequest: null,
    settingsResponse: null,
    language: 'zh',
    needFooter: false,
}

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {

        // public information
        case actions.SET_PUBLIC_INFORMATION:
            return { ...state, ...action.payload };

        // settings
        case actions.GET_SETTINGS:
            return { ...state, settingsRequest: action.payload };

        case actions.GET_SETTINGS_FAIL:
            return {
                ...state,
                settingsResponse: updateSettingsState(action.payload),
                settings: updateSettings(state.settings, state.settingsRequest.type, null),
            };

        case actions.GET_SETTINGS_SUCCESS:
            return {
                ...state,
                settingsResponse: updateSettingsState(action.payload),
                settings: updateSettings(state.settings, state.settingsRequest.type, action.payload.result),
            };

        // ui state
        case actions.SET_REFERRER:
            return { ...state, referrer: action.payload };

        case actions.SET_LANGUAGE:
            return { ...state, language: action.payload };

        case actions.TOGGLE_FOOTER:
            return { ...state, needFooter: !state.needFooter };

        default:
            return state;
    }
}

function updateSettingsState(payload: SettingsResponse): ResponseState {
    return {
        action: payload.action,
        error: payload.error,
    }
}

function updateSettings(settings: Settings, key: string, data: any): Settings {
    const result = { ...settings };

    result[key] = data;

    return result;
}

export const getBalance = (state: State) => state.balance;

export const getConsumed = (state: State) => state.consumed;

export const getUsername = (state: State) => state.username || localStorage.getItem(LocalStorageKey.username);

export const getToken = (state: State) => state.token || localStorage.getItem(LocalStorageKey.token);

export const getVersion = (state: State) => state.version;

export const getIsAdmin = (state: State) => state.is_admin;

export const getReferrer = (state: State) => state.referrer;

export const getSettingsResponse = (state: State) => state.settingsResponse;

export const getSettings = (state: State) => state.settings;

export const getLanguage = (state: State) => state.language;

export const getFooterState = (state: State) => state.needFooter;

export const getError = (state: State) => state.error;
