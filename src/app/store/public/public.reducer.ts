import { LocalStorageKey } from '../../app.config';
import { PublicResponse, ResponseState, SettingsResponse, ServerSendEventType } from '../../interfaces/response.interface';
import { EditorConfig, Referrer } from './../../interfaces/app.interface';
import { SettingsRequest } from './../../interfaces/request.interface';
import * as actions from './public.action';

export interface Settings {
    agreement: string;
    about: string;
    api: string;
    promotion: Object;
    docker: Object;
    brokers: Object;
    index: Object;
    backtest_javascript: string; // FIXME: 偷个懒就用了下划线命名了，只此一次，下不为例。
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
    serverSendMessageSubscribeState: { [key: string]: boolean }; // 用来控制是否处理服务端相应的
}

const editor = JSON.parse(localStorage.getItem(LocalStorageKey.editorConfig));

export const initialState: State = {
    referrer: null,
    publicRes: null,
    settings: {
        agreement: null,
        about: null,
        api: null,
        promotion: null,
        docker: null,
        brokers: null,
        index: null,
        backtest_javascript: null,
    },
    settingsRequest: null,
    settingsResponse: null,
    language: 'zh',
    needFooter: false,
    editorConfig: editor || null,
    serverSendMessageSubscribeState: {
        robot: false,
        node: false,
        rsync: false,
        payment: false,
        charge: false,
        backtest: false,
    }
}

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

export const getServerMsgSubscribeState = (state: State) => state.serverSendMessageSubscribeState;
