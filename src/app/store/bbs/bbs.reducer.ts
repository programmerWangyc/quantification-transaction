import { GetBBSNodeListResponse, GetBBSPlaneListResponse, GetBBSTopicListBySlugResponse, GetBBSTopicResponse } from '../../interfaces/response.interface';
import { GetBBSTopicListBySlugRequest, GetBBSTopicRequest } from '../../interfaces/request.interface';
import * as actions from './bbs.action';

export interface RequestParams {
    topicListBySlug: GetBBSTopicListBySlugRequest;
    topicById: GetBBSTopicRequest;
}

export interface UIState {
    loading: boolean;
}

export interface State {
    UIState: UIState;
    nodeListRes: GetBBSNodeListResponse;
    planeListRes: GetBBSPlaneListResponse;
    requestParams: RequestParams;
    topicListBySlugRes: GetBBSTopicListBySlugResponse;
    topicByIdRes: GetBBSTopicResponse;
}

const initialUIState: UIState = {
    loading: false,
};

const initialRequestParams: RequestParams = {
    topicListBySlug: null,
    topicById: null,
};

const initialState: State = {
    UIState: initialUIState,
    nodeListRes: null,
    planeListRes: null,
    requestParams: initialRequestParams,
    topicListBySlugRes: null,
    topicByIdRes: null,
};

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {

        // plane list
        case actions.GET_BBS_PLANE_LIST_FAIL:
        case actions.GET_BBS_PLANE_LIST_SUCCESS:
            return { ...state, planeListRes: action.payload };

        // node list
        case actions.GET_BBS_NODE_LIST_FAIL:
        case actions.GET_BBS_NODE_LIST_SUCCESS:
            return { ...state, nodeListRes: action.payload };

        // topic list by slug
        case actions.GET_BBS_TOPIC_LIST_BY_SLUG:
            return { ...state, requestParams: { ...state.requestParams, topicListBySlug: action.payload }, UIState: { ...state.UIState, loading: true } };

        case actions.GET_BBS_TOPIC_LIST_BY_SLUG_FAIL:
        case actions.GET_BBS_TOPIC_LIST_BY_SLUG_SUCCESS:
            return { ...state, topicListBySlugRes: action.payload, UIState: { ...state.UIState, loading: false } };

        // topic by id
        case actions.GET_BBS_TOPIC_BY_ID:
            return { ...state, requestParams: { ...state.requestParams, topicById: action.payload }, UIState: { ...state.UIState, loading: true } };

        case actions.GET_BBS_TOPIC_BY_ID_FAIL:
        case actions.GET_BBS_TOPIC_BY_ID_SUCCESS:
            return { ...state, topicByIdRes: action.payload, UIState: { ...state.UIState, loading: false } };

        case actions.GET_BBS_NODE_LIST:
        case actions.GET_BBS_PLANE_LIST:

        // ===================================================Local state===========================================

        case actions.RESET_BBS_TOPIC:
            return { ...state, topicByIdRes: null };

        default:
            return state;
    }
}

export const getPlaneListRes = (state: State) => state.planeListRes;

export const getNodeListRes = (state: State) => state.nodeListRes;

export const getTopicListBySlugRes = (state: State) => state.topicListBySlugRes;

export const getRequestParams = (state: State) => state.requestParams;

export const getTopicByIdRes = (state: State) => state.topicByIdRes;

export const getUIState = (state: State) => state.UIState;
