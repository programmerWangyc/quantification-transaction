import {
    DeleteAPMMessageRequest, DeleteBBSNotifyRequest, DeleteMessageRequest, GetAPMMessageRequest, GetBBSNotifyRequest,
    GetMessageRequest
} from '../../interfaces/request.interface';
import {
    DeleteAPMMessageResponse, DeleteBBSNotifyResponse, DeleteMessageResponse, GetAPMMessageResponse,
    GetBBSNotifyResponse, GetMessageResponse, BaseMessage
} from '../../interfaces/response.interface';
import * as actions from './message.action';

export interface RequestParams {
    apmMessage: GetAPMMessageRequest;
    bbsNotify: GetBBSNotifyRequest;
    deleteApmMessage: DeleteAPMMessageRequest;
    deleteBBSNotify: DeleteBBSNotifyRequest;
    deleteMessage: DeleteMessageRequest;
    message: GetMessageRequest;
}

export interface State {
    apmMessageRes: GetAPMMessageResponse;
    bbsNotifyRes: GetBBSNotifyResponse;
    deleteApmMessageRes: DeleteAPMMessageResponse;
    deleteBBSNotifyRes: DeleteBBSNotifyResponse;
    deleteMessageRes: DeleteMessageResponse;
    messageRes: GetMessageResponse;
    requestParams: RequestParams;
}

const initialRequestParams: RequestParams = {
    apmMessage: null,
    bbsNotify: null,
    deleteApmMessage: null,
    deleteBBSNotify: null,
    deleteMessage: null,
    message: null,
};

const initialState: State = {
    apmMessageRes: null,
    bbsNotifyRes: null,
    deleteApmMessageRes: null,
    deleteBBSNotifyRes: null,
    deleteMessageRes: null,
    messageRes: null,
    requestParams: initialRequestParams,
};

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {
        // message
        case actions.GET_MESSAGE:
            return { ...state, requestParams: { ...state.requestParams, message: action.payload } };

        case actions.GET_MESSAGE_FAIL:
        case actions.GET_MESSAGE_SUCCESS:
            return { ...state, messageRes: action.payload };

        // delete message
        case actions.DELETE_MESSAGE:
            return { ...state, requestParams: { ...state.requestParams, deleteMessage: action.payload } };

        case actions.DELETE_MESSAGE_FAIL:
            return { ...state, deleteMessageRes: action.payload };

        case actions.DELETE_MESSAGE_SUCCESS: {
            const { sns, items } = state.messageRes.result;

            const { id } = state.requestParams.deleteMessage;

            return { ...state, deleteMessageRes: action.payload, messageRes: { ...state.messageRes, result: { sns, items: updateMsg(id, items) } } };
        }

        // apm message
        case actions.GET_APM_MESSAGE:
            return { ...state, requestParams: { ...state.requestParams, apmMessage: action.payload } };

        case actions.GET_APM_MESSAGE_FAIL:
        case actions.GET_APM_MESSAGE_SUCCESS:
            return { ...state, apmMessageRes: action.payload };

        // delete apm message
        case actions.DELETE_APM_MESSAGE:
            return { ...state, requestParams: { ...state.requestParams, deleteApmMessage: action.payload } };

        case actions.DELETE_APM_MESSAGE_FAIL:
            return { ...state, deleteApmMessageRes: action.payload };

        case actions.DELETE_APM_MESSAGE_SUCCESS: {
            const { sns, items } = state.apmMessageRes.result;

            const { id } = state.requestParams.deleteApmMessage;

            return { ...state, deleteApmMessageRes: action.payload, apmMessageRes: { ...state.apmMessageRes, result: { sns, items: updateMsg(id, items) } } };
        }

        // bbs notify
        case actions.GET_BBS_NOTIFY:
            return { ...state, requestParams: { ...state.requestParams, bbsNotify: action.payload } };

        case actions.GET_BBS_NOTIFY_FAIL:
        case actions.GET_BBS_NOTIFY_SUCCESS:
            return { ...state, bbsNotifyRes: action.payload };

        // delete bbs notify
        case actions.DELETE_BBS_NOTIFY:
            return { ...state, requestParams: { ...state.requestParams, deleteBBSNotify: action.payload } };

        case actions.DELETE_BBS_NOTIFY_FAIL:
            return { ...state, deleteBBSNotifyRes: action.payload };

        case actions.DELETE_BBS_NOTIFY_SUCCESS: {
            const { items } = state.bbsNotifyRes.result;

            const { id } = state.requestParams.deleteBBSNotify;

            return { ...state, deleteBBSNotifyRes: action.payload, bbsNotifyRes: { ...state.bbsNotifyRes, result: { items: updateMsg(id, items) } } };
        }

        default:
            return state;
    }
}

/**
 * @ignore
 */
function updateMsg<T extends BaseMessage>(id: number, items: T[]): T[] {
    return id === -1 ? [] : items.filter(msg => msg.id !== id);
}

export const getMessageRes = (state: State) => state.messageRes;

export const getAPMMessageRes = (state: State) => state.apmMessageRes;

export const getNotifyRes = (state: State) => state.bbsNotifyRes;

export const getDeleteMessageRes = (state: State) => state.deleteMessageRes;

export const getDeleteAPMMessageRes = (state: State) => state.deleteApmMessageRes;

export const getDeleteNotifyRes = (state: State) => state.deleteBBSNotifyRes;

export const getRequestParams = (state: State) => state.requestParams;

