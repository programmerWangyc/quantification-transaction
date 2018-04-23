import { GetNodeListResponse } from './../../interfaces/response.interface';
import * as actions from './bt-node.action';

export interface State {
    nodeListRes: GetNodeListResponse;
}

const initialState: State = {
    nodeListRes: null,
}

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {
        case actions.GET_NODE_LIST_FAIL:
        case actions.GET_NODE_LIST_SUCCESS:
            return { nodeListRes: action.payload };

        case actions.GET_NODE_LIST:
        default:
            return state;
    }
}

export const getNodeListResponse = (state: State) => state.nodeListRes;