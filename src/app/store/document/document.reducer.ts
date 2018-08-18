import { GetBBSTopicRequest } from '../../interfaces/request.interface';
import { GetBBSTopicResponse } from '../../interfaces/response.interface';
import * as actions from './document.action';

export interface RequestParams {
    topicById: GetBBSTopicRequest;
}

export interface UIState {
    loading: boolean;
}

export interface State {
    UIState: UIState;
    requestParams: RequestParams;
    topicByIdRes: GetBBSTopicResponse;
}

const initialUIState: UIState = {
    loading: false,
};

const initialRequestParams: RequestParams = {
    topicById: null,
};

const initialState: State = {
    UIState: initialUIState,
    requestParams: initialRequestParams,
    topicByIdRes: null,
};

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {

        // topic by id
        case actions.GET_DOCUMENT:
            return { ...state, requestParams: { ...state.requestParams, topicById: action.payload }, UIState: { ...state.UIState, loading: true } };

        case actions.GET_DOCUMENT_FAIL:
        case actions.GET_DOCUMENT_SUCCESS:
            return { ...state, topicByIdRes: action.payload, UIState: { ...state.UIState, loading: false } };

        // ===================================================Local state===========================================

        default:
            return state;
    }
}

export const getRequestParams = (state: State) => state.requestParams;

export const getTopicByIdRes = (state: State) => state.topicByIdRes;

export const getUIState = (state: State) => state.UIState;
