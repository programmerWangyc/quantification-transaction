import { LocalStorageKey } from '../../app.config';
import { PublicResponse, ResponseState, SettingsResponse } from '../../interfaces/response.interface';
import { EditorConfig, Referrer } from './../../interfaces/app.interface';
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

export interface State {
    referrer: Referrer;
    settings: Settings;
    publicRes: PublicResponse;
    settingsResponse: ResponseState;
    settingsRequest: SettingsRequest;
    language: string;
    needFooter: boolean;
    editorConfig: EditorConfig;
}

const editor = JSON.parse(localStorage.getItem(LocalStorageKey.editorConfig));

export const initialState: State = {
    referrer: null,
    publicRes: null,
    settings: null,
    settingsRequest: null,
    settingsResponse: null,
    language: 'zh',
    needFooter: false,
    editorConfig: editor || null,
}

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {

        // public information
        case actions.SET_PUBLIC_INFORMATION:
            return { ...state, publicRes: action.payload };

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

        case actions.UPDATE_FAVORITE_EDITOR_CONFIG: {
            const editorConfig = { ...state.editorConfig, ...action.payload };

            localStorage.setItem(LocalStorageKey.editorConfig, JSON.stringify(editorConfig));

            return { ...state, editorConfig };
        }

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

export const getPublicResponse = (state: State) => state.publicRes;

export const getReferrer = (state: State) => state.referrer;

export const getSettingsResponse = (state: State) => state.settingsResponse;

export const getSettings = (state: State) => state.settings;

export const getLanguage = (state: State) => state.language;

export const getFooterState = (state: State) => state.needFooter;

export const getEditorConfig = (state: State) => state.editorConfig;
