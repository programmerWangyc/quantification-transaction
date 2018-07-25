import { GetNodeListResponse, DeleteNodeResponse, GetNodeHashResponse } from '../../interfaces/response.interface';
import * as actions from './bt-node.action';
import { DeleteNodeRequest } from '../../interfaces/request.interface';

export interface RequestState {
    delete: DeleteNodeRequest;
}

export interface UIState {
    isLoading: boolean;
}

export interface State {
    nodeListRes: GetNodeListResponse;
    nodeDeleteRes: DeleteNodeResponse;
    request: RequestState;
    UIState: UIState;
    nodeHashRes: GetNodeHashResponse;
}

const initialState: State = {
    nodeListRes: null,
    nodeDeleteRes: null,
    request: {
        delete: null,
    },
    UIState: {
        isLoading: false,
    },
    nodeHashRes: null,
};

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {
        case actions.GET_NODE_LIST:
            return { ...state, UIState: { ...state.UIState, isLoading: true } };

        case actions.GET_NODE_LIST_FAIL:
        case actions.GET_NODE_LIST_SUCCESS:
            return { ...state, nodeListRes: action.payload, UIState: { ...state.UIState, isLoading: false } };

        case actions.DELETE_NODE:
            return { ...state, request: { ...state.request, delete: action.payload } };

        case actions.DELETE_NODE_FAIL_ACTION:
        case actions.DELETE_NODE_SUCCESS_ACTION:
            return { ...state, nodeDeleteRes: action.payload };

        case actions.GET_NODE_HASH_FAIL:
        case actions.GET_NODE_HASH_SUCCESS:
            return { ...state, nodeHashRes: action.payload };

        case actions.GET_NODE_HASH:
        default:
            return state;
    }
}

export const getNodeListResponse = (state: State) => state.nodeListRes;

export const getNodeDeleteResponse = (state: State) => state.nodeDeleteRes;

export const getUIState = (state: State) => state.UIState;

export const getNodeHashResponse = (state: State) => state.nodeHashRes;
