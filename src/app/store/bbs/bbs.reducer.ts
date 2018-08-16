import { GetBBSNodeListResponse, GetBBSPlaneListResponse, GetBBSTopicListBySlugResponse, AddBBSTopicResponse, GetBBSTopicResponse, GetQiniuTokenResponse } from '../../interfaces/response.interface';
import { GetBBSTopicListBySlugRequest, GetBBSTopicRequest, AddBBSTopicRequest, GetQiniuTokenRequest } from '../../interfaces/request.interface';
import * as actions from './bbs.action';

export interface RequestParams {
    addTopic: AddBBSTopicRequest;
    topicById: GetBBSTopicRequest;
    topicListBySlug: GetBBSTopicListBySlugRequest;
    qiniuToken: GetQiniuTokenRequest;
}

export interface UIState {
    loading: boolean;
}

export interface State {
    UIState: UIState;
    addTopicRes: AddBBSTopicResponse;
    nodeListRes: GetBBSNodeListResponse;
    planeListRes: GetBBSPlaneListResponse;
    qiniuTokenRes: GetQiniuTokenResponse;
    requestParams: RequestParams;
    topicByIdRes: GetBBSTopicResponse;
    topicListBySlugRes: GetBBSTopicListBySlugResponse;
}

const initialUIState: UIState = {
    loading: false,
};

const initialRequestParams: RequestParams = {
    addTopic: null,
    qiniuToken: null,
    topicById: null,
    topicListBySlug: null,
};

const initialState: State = {
    UIState: initialUIState,
    addTopicRes: null,
    nodeListRes: null,
    planeListRes: null,
    qiniuTokenRes: null,
    requestParams: initialRequestParams,
    topicByIdRes: null,
    topicListBySlugRes: null,
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

        // add bbs topic
        case actions.ADD_BBS_TOPIC:
            return { ...state, UIState: { ...state.UIState, loading: true }, requestParams: { ...state.requestParams, addTopic: action.payload } };

        case actions.ADD_BBS_TOPIC_FAIL:
        case actions.ADD_BBS_TOPIC_SUCCESS:
            return { ...state, UIState: { ...state.UIState, loading: false }, addTopicRes: action.payload };

        // qiniu token
        case actions.GET_QINIU_TOKEN:
            return { ...state, requestParams: { ...state.requestParams, qiniuToken: action.payload } };

        case actions.GET_QINIU_TOKEN_FAIL:
        case actions.GET_QINIU_TOKEN_SUCCESS:
            return { ...state, qiniuTokenRes: action.payload };

        // ===================================================Local state===========================================

        case actions.RESET_BBS_TOPIC:
            return { ...state, topicByIdRes: null, addTopicRes: null, requestParams: { ...state.requestParams, addTopic: null, qiniuToken: null } };

        case actions.CLEAR_QINIU_TOKEN:
            return { ...state, qiniuTokenRes: null, requestParams: { ...state.requestParams, qiniuToken: null } };

        case actions.GET_BBS_NODE_LIST:
        case actions.GET_BBS_PLANE_LIST:
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

export const getAddTopiRes = (state: State) => state.addTopicRes;

export const getQiniuTokenRes = (state: State) => state.qiniuTokenRes;
