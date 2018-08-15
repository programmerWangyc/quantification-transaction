import { GetBBSNodeListResponse, GetBBSPlaneListResponse, GetBBSTopicListBySlugResponse } from '../../interfaces/response.interface';
import { GetBBSTopicListBySlugRequest } from '../../interfaces/request.interface';
import * as actions from './bbs.action';

export interface RequestParams {
    topicListBySlug: GetBBSTopicListBySlugRequest;
}

export interface UIState {
}

export interface State {
    nodeListRes: GetBBSNodeListResponse;
    planeListRes: GetBBSPlaneListResponse;
    requestParams: RequestParams;
    topicListBySlugRes: GetBBSTopicListBySlugResponse;
}

const initialRequestParams: RequestParams = {
    topicListBySlug: null,
};

const initialState: State = {
    nodeListRes: null,
    planeListRes: null,
    requestParams: initialRequestParams,
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
            return { ...state, requestParams: { ...state.requestParams, topicListBySlug: action.payload } };

        case actions.GET_BBS_TOPIC_LIST_BY_SLUG_FAIL:
        case actions.GET_BBS_TOPIC_LIST_BY_SLUG_SUCCESS:
            return { ...state, topicListBySlugRes: action.payload };

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
