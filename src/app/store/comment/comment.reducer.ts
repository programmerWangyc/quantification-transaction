import * as moment from 'moment';

import { LocalStorageKey } from '../../app.config';
import { GetCommentListRequest, GetQiniuTokenRequest, SubmitCommentRequest } from '../../interfaces/request.interface';
import {
    BtComment, GetCommentListResponse, GetQiniuTokenResponse, SubmitCommentResponse, CommentListResponse, Reply
} from '../../interfaces/response.interface';
import * as actions from './comment.action';

export interface UIState {
    loading: boolean;
}

export interface RequestParams {
    addComment: SubmitCommentRequest;
    commentList: GetCommentListRequest;
    deleteComment: SubmitCommentRequest;
    qiniuToken: GetQiniuTokenRequest;
    updateComment: SubmitCommentRequest;
}

export interface State {
    UIState: UIState;
    commentListRes: GetCommentListResponse;
    qiniuTokenRes: GetQiniuTokenResponse;
    requestParams: RequestParams;
    submitCommentRes: SubmitCommentResponse;
}

const initialUIState: UIState = {
    loading: false,
};

const initialRequestParams: RequestParams = {
    addComment: null,
    commentList: null,
    deleteComment: null,
    qiniuToken: null,
    updateComment: null,
};

const initialState: State = {
    UIState: initialUIState,
    commentListRes: null,
    qiniuTokenRes: null,
    requestParams: initialRequestParams,
    submitCommentRes: null,
};

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {
        // comment list
        case actions.GET_COMMENT_LIST:
            return { ...state, requestParams: { ...state.requestParams, commentList: action.payload } };

        case actions.GET_COMMENT_LIST_FAIL:
        case actions.GET_COMMENT_LIST_SUCCESS:
            return { ...state, commentListRes: action.payload };

        // add comment
        case actions.ADD_COMMENT:
            return { ...state, requestParams: { ...state.requestParams, addComment: action.payload }, UIState: { loading: true } };

        case actions.ADD_COMMENT_FAIL:
            return { ...state, submitCommentRes: action.payload, UIState: { loading: false } };

        case actions.ADD_COMMENT_SUCCESS: {
            const result = addComment(state.requestParams.addComment, state.commentListRes.result, action.payload.result);

            return { ...state, submitCommentRes: action.payload, commentListRes: { ...state.commentListRes, result }, UIState: { loading: false } };
        }

        // delete comment
        case actions.DELETE_COMMENT:
            return { ...state, requestParams: { ...state.requestParams, deleteComment: action.payload }, UIState: { loading: true } };

        case actions.DELETE_COMMENT_FAIL:
            return { ...state, submitCommentRes: action.payload, UIState: { loading: false } };

        case actions.DELETE_COMMENT_SUCCESS: {
            const result = deleteComment(state.requestParams.deleteComment, state.commentListRes.result);

            return { ...state, submitCommentRes: action.payload, commentListRes: { ...state.commentListRes, result }, UIState: { loading: false } };
        }

        // update comment
        case actions.UPDATE_COMMENT:
            return { ...state, requestParams: { ...state.requestParams, updateComment: action.payload }, UIState: { loading: true } };

        case actions.UPDATE_COMMENT_FAIL:
            return { ...state, submitCommentRes: action.payload, UIState: { loading: false } };

        case actions.UPDATE_COMMENT_SUCCESS: {
            const result = updateComment(state.requestParams.updateComment, state.commentListRes.result);

            return { ...state, submitCommentRes: action.payload, commentListRes: { ...state.commentListRes, result }, UIState: { loading: false } };
        }

        // qiniu token
        case actions.GET_QINIU_TOKEN:
            return { ...state, requestParams: { ...state.requestParams, qiniuToken: action.payload } };

        case actions.GET_QINIU_TOKEN_FAIL:
        case actions.GET_QINIU_TOKEN_SUCCESS:
            return { ...state, qiniuTokenRes: action.payload };

        // =======================================================Local action==========================================

        case actions.CLEAR_QINIU_TOKEN:
            return { ...state, qiniuTokenRes: null };

        default:
            return state;
    }
}

/**
 * @ignore
 */
function addComment(req: SubmitCommentRequest, data: CommentListResponse, id: number): CommentListResponse {
    const { replyId, content, subReplyId } = req;

    const { all, reply, comments } = data;

    const latestComment: BtComment = { id, is_owner: true, content, created: moment().format('YYYY-MM-DD HH:mm:ss'), username: localStorage.getItem(LocalStorageKey.username) };

    if (replyId !== -1) {
        const latestReply = subReplyId === -1 ? { ...latestComment, reply_id: replyId } : { ...latestComment, reply_id: replyId, sub_reply_id: subReplyId };

        return { all: all + 1, reply: [latestReply, ...reply], comments };
    } else {
        return { all: all + 1, reply, comments: [latestComment, ...comments] };
    }
}

/**
 * @ignore
 */
function deleteComment(req: SubmitCommentRequest, data: CommentListResponse): CommentListResponse {
    const { commentId } = req;

    const { all, reply, comments } = data;

    const predicate = (item: BtComment | Reply) => item.id !== commentId;

    return { all: all - 1, reply: reply.filter(predicate), comments: comments.filter(predicate) };

}

/**
 * @ignore
 */
function updateComment(req: SubmitCommentRequest, data: CommentListResponse): CommentListResponse {
    const { commentId, content } = req;

    const { all, reply, comments } = data;

    const predicate = (item: BtComment | Reply) => item.id === commentId;

    const commentIdx = comments.findIndex(predicate);

    if (commentIdx !== -1) {
        comments[commentIdx].content = content;

        return { all, reply, comments: [...comments] };
    } else {
        const replyIdx = reply.findIndex(predicate);

        reply[replyIdx].content = content;

        return { all, reply: [...reply], comments };
    }
}

export const getCommentListRes = (state: State) => state.commentListRes;

export const getSubmitCommentRes = (state: State) => state.submitCommentRes;

export const getQiniuTokenRes = (state: State) => state.qiniuTokenRes;

export const getRequestParams = (state: State) => state.requestParams;

export const getUIState = (state: State) => state.UIState;
