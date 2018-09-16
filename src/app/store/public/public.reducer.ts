import { LocalStorageKey } from '../../app.config';
import { EditorConfig, Referrer } from '../../interfaces/app.interface';
import { SettingsRequest, ChangeAlertThresholdSettingRequest } from '../../interfaces/request.interface';
import { PublicResponse, ResponseState, ServerSendEventType, SettingsResponse, LogoutResponse, ChangeAlertThresholdSettingResponse, GetAccountSummaryResponse } from '../../interfaces/response.interface';
import * as actions from './public.action';

export interface Settings {
    about: string;
    agreement: string;
    backtest_javascript: string; // !FIXME: 偷个懒就用了下划线命名了，只此一次，下不为例。
    brokers: string;
    docker: object;
    index: object;
    promotion: object;
    [key: string]: any;
}

export interface RequestParams {
    changeAlertThreshold: ChangeAlertThresholdSettingRequest;
}

export interface State {
    accountSummary: GetAccountSummaryResponse;
    changeAlertThresholdRes: ChangeAlertThresholdSettingResponse;
    editorConfig: EditorConfig;
    language: string;
    logoutRes: LogoutResponse;
    needFooter: boolean;
    publicRes: PublicResponse;
    referrer: Referrer;
    requestParams: RequestParams;
    serverSendMessageSubscribeState: { [key: string]: boolean }; // 用来控制是否处理服务端相应的消息推送。
    settings: Settings;
    settingsRequest: SettingsRequest;
    settingsResponse: ResponseState;
}

const editor = JSON.parse(localStorage.getItem(LocalStorageKey.editorConfig));

const initialSettings = {
    about: null,
    agreement: null,
    api: null,
    backtest_javascript: null,
    brokers: null,
    docker: null,
    index: null,
    promotion: null,
};

const initialRequestParams: RequestParams = {
    changeAlertThreshold: null,
};

const initialSubscribeState: { [key: string]: boolean } = {
    backtest: false,
    charge: false,
    node: false,
    payment: false,
    robot: false,
    rsync: false,
};

export const initialState: State = {
    accountSummary: null,
    changeAlertThresholdRes: null,
    editorConfig: editor || null,
    language: 'zh',
    logoutRes: null,
    needFooter: false,
    publicRes: null,
    referrer: null,
    requestParams: initialRequestParams,
    serverSendMessageSubscribeState: initialSubscribeState,
    settings: initialSettings,
    settingsRequest: null,
    settingsResponse: null,
};

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {

        // public information
        case actions.SET_PUBLIC_INFORMATION: {
            const { event } = action.payload;

            if (event === ServerSendEventType.BACKTEST) {
                return { ...state, publicRes: { ...state.publicRes, event } }; // 服务器推送的回测消息中只有event，没有其它的公共信息。
            } else {
                return { ...state, publicRes: action.payload };
            }
        }

        // server send message subscribe switch
        case actions.TOGGLE_SUBSCRIBE_SERVER_SEND_MESSAGE_TYPE: {
            const { message, status } = action.payload;

            return { ...state, serverSendMessageSubscribeState: { ...state.serverSendMessageSubscribeState, [message]: status } };
        }

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

        // logout
        case actions.LOGOUT_FAIL:
            return { ...state, logoutRes: action.payload };

        case actions.LOGOUT_SUCCESS: {
            localStorage.clear();

            return { ...state, logoutRes: action.payload, publicRes: null };
        }

        // change alert threshold setting
        case actions.CHANGE_ALERT_THRESHOLD_SETTING:
            return { ...state, requestParams: { ...state.requestParams, changeAlertThreshold: action.payload } };

        case actions.CHANGE_ALERT_THRESHOLD_SETTING_FAIL:
        case actions.CHANGE_ALERT_THRESHOLD_SETTING_SUCCESS:
            return { ...state, changeAlertThresholdRes: action.payload };

        // get account summary
        case actions.GET_ACCOUNT_SUMMARY_FAIL:
        case actions.GET_ACCOUNT_SUMMARY_SUCCESS:
            return { ...state, accountSummary: action.payload };

        // ==============================================ui state=========================================

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

        // clear logout response
        case actions.RESET_LOGOUT_RESPONSE:
            return { ...state, logoutRes: null };

        case actions.GET_ACCOUNT_SUMMARY:
        case actions.LOGOUT:
        default:
            return state;
    }
}

function updateSettingsState(payload: SettingsResponse): ResponseState {
    return {
        action: payload.action,
        error: payload.error,
    };
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

export const getServerMsgSubscribeState = (state: State) => state.serverSendMessageSubscribeState;

export const getLogoutRes = (state: State) => state.logoutRes;

export const getChangeAlertThresholdRes = (state: State) => state.changeAlertThresholdRes;

export const getRequestParams = (state: State) => state.requestParams;

export const getAccountSummaryResponse = (state: State) => state.accountSummary;
