import { GetCommentListRequest, GetQiniuTokenRequest, SubmitCommentRequest } from '../../interfaces/request.interface';
import {
    GetCommentListResponse, GetQiniuTokenResponse, SubmitCommentResponse
} from '../../interfaces/response.interface';
import * as actions from './comment.action';

export interface RequestParams {
    commentList: GetCommentListRequest;
    submitComment: SubmitCommentRequest;
    qiniuToken: GetQiniuTokenRequest;
}

export interface State {
    commentListRes: GetCommentListResponse;
    submitCommentRes: SubmitCommentResponse;
    qiniuTokenRes: GetQiniuTokenResponse;
    requestParams: RequestParams;
}

const initialRequestParams: RequestParams = {
    commentList: null,
    submitComment: null,
    qiniuToken: null,
};

const initialState: State = {
    commentListRes: null,
    submitCommentRes: null,
    qiniuTokenRes: null,
    requestParams: initialRequestParams,
};

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {
        // comment list
        case actions.GET_COMMENT_LIST:
            return { ...state, requestParams: { ...state.requestParams, commentList: action.payload } };

        case actions.GET_COMMENT_LIST_FAIL:
        case actions.GET_COMMENT_LIST_SUCCESS:
            return { ...state, commentListRes: action.payload };

        // submit comment
        case actions.SUBMIT_COMMENT:
            return { ...state, requestParams: { ...state.requestParams, submitComment: action.payload } };

        case actions.SUBMIT_COMMENT_FAIL:
        case actions.SUBMIT_COMMENT_SUCCESS:
            return { ...state, submitCommentRes: action.payload };

        // qiniu token
        case actions.GET_QINIU_TOKEN:
            return { ...state, requestParams: { ...state.requestParams, qiniuToken: action.payload } };

        case actions.GET_QINIU_TOKEN_FAIL:
        case actions.GET_QINIU_TOKEN_SUCCESS:
            return { ...state, qiniuTokenRes: action.payload };

        default:
            return state;
    }
}

export const getCommentListRes = (state: State) => state.commentListRes;

export const getSubmitCommentRes = (state: State) => state.submitCommentRes;

export const getQiniuTokenRes = (state: State) => state.qiniuTokenRes;

export const getRequestParams = (state: State) => state.requestParams;
