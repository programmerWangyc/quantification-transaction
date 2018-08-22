import {
    BindGoogleAuthRequest, ChangeNickNameRequest, ChangePasswordRequest, DeleteShadowMemberRequest,
    LockShadowMemberRequest, SaveShadowMemberRequest
} from '../../interfaces/request.interface';
import {
    BindGoogleAuthResponse, ChangeNickNameResponse, ChangePasswordResponse, DeleteShadowMemberResponse,
    GetAccountResponse, GetGoogleAuthKeyResponse, GetShadowMemberResponse, LockShadowMemberResponse,
    SaveShadowMemberResponse, UnbindSNSResponse
} from '../../interfaces/response.interface';
import * as actions from './account.action';

export interface RequestParams {
    bindGoogleAuth: BindGoogleAuthRequest;
    changeNickname: ChangeNickNameRequest;
    changePassword: ChangePasswordRequest;
    deleteShadowMember: DeleteShadowMemberRequest;
    lockShadowMember: LockShadowMemberRequest;
    addShadowMember: SaveShadowMemberRequest;
    updateShadowMember: SaveShadowMemberRequest;
}

export interface UIState {
    loading: boolean;
}

export interface State {
    UIState: UIState;
    bindGoogleAuthRes: BindGoogleAuthResponse;
    changeNicknameRes: ChangeNickNameResponse;
    changePasswordRes: ChangePasswordResponse;
    deleteShadowMemberRes: DeleteShadowMemberResponse;
    getAccountRes: GetAccountResponse;
    getShadowMemberRes: GetShadowMemberResponse;
    googleAuthKeyRes: GetGoogleAuthKeyResponse;
    lockShadowMemberRes: LockShadowMemberResponse;
    requestParams: RequestParams;
    addShadowMemberRes: SaveShadowMemberResponse;
    updateShadowMemberRes: SaveShadowMemberResponse;
    unbindSNSRes: UnbindSNSResponse;
}

const initialRequestParams: RequestParams = {
    bindGoogleAuth: null,
    changeNickname: null,
    changePassword: null,
    deleteShadowMember: null,
    lockShadowMember: null,
    addShadowMember: null,
    updateShadowMember: null,
};

const initialUIState: UIState = {
    loading: false,
};

const initialState: State = {
    UIState: initialUIState,
    addShadowMemberRes: null,
    bindGoogleAuthRes: null,
    changeNicknameRes: null,
    changePasswordRes: null,
    deleteShadowMemberRes: null,
    getAccountRes: null,
    getShadowMemberRes: null,
    googleAuthKeyRes: null,
    lockShadowMemberRes: null,
    requestParams: initialRequestParams,
    unbindSNSRes: null,
    updateShadowMemberRes: null,
};

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {
        // modify password
        case actions.CHANGE_PASSWORD:
            return { ...state, requestParams: { ...state.requestParams, changePassword: action.payload }, UIState: { ...state.UIState, loading: true } };

        case actions.CHANGE_PASSWORD_FAIL:
        case actions.CHANGE_PASSWORD_SUCCESS:
            return { ...state, changePasswordRes: action.payload, UIState: { ...state.UIState, loading: false } };

        // modify nickname
        case actions.CHANGE_NICKNAME:
            return { ...state, requestParams: { ...state.requestParams, changeNickname: action.payload }, UIState: { ...state.UIState, loading: true } };

        case actions.CHANGE_NICKNAME_FAIL:
        case actions.CHANGE_NICKNAME_SUCCESS:
            return { ...state, changeNicknameRes: action.payload, UIState: { ...state.UIState, loading: false } };

        // google auth key
        case actions.GET_GOOGLE_AUTH_KEY_FAIL:
        case actions.GET_GOOGLE_AUTH_KEY_SUCCESS:
            return { ...state, googleAuthKeyRes: action.payload };

        // unbind sns
        case actions.UNBIND_SNS_FAIL:
        case actions.UNBIND_SNS_SUCCESS:
            return { ...state, unbindSNSRes: action.payload };

        // bind google verify code
        case actions.BIND_GOOGLE_AUTH:
            return { ...state, requestParams: { ...state.requestParams, bindGoogleAuth: action.payload } };

        case actions.BIND_GOOGLE_AUTH_FAIL:
        case actions.BIND_GOOGLE_AUTH_SUCCESS:
            return { ...state, bindGoogleAuthRes: action.payload };

        // get shadow member
        case actions.GET_SHADOW_MEMBER:
            return { ...state, UIState: { ...state.UIState, loading: true } };

        case actions.GET_SHADOW_MEMBER_FAIL:
        case actions.GET_SHADOW_MEMBER_SUCCESS:
            return { ...state, getShadowMemberRes: action.payload, UIState: { ...state.UIState, loading: false } };

        // get account
        case actions.GET_ACCOUNT_FAIL:
        case actions.GET_ACCOUNT_SUCCESS:
            return { ...state, getAccountRes: action.payload };

        // add shadow member
        case actions.ADD_SHADOW_MEMBER:
            return { ...state, requestParams: { ...state.requestParams, addShadowMember: action.payload } };

        case actions.ADD_SHADOW_MEMBER_FAIL:
            return { ...state, addShadowMemberRes: action.payload };

        case actions.ADD_SHADOW_MEMBER_SUCCESS: {
            const { result } = state.getShadowMemberRes;

            const { items, robots } = result;

            const { username, permissions } = state.requestParams.addShadowMember;

            return { ...state, addShadowMemberRes: action.payload, getShadowMemberRes: { ...state.getShadowMemberRes, result: { items: [...items, { id: action.payload.result, username, status: 0, permission: permissions.join(','), last_input: null, last_login: '--', last_login_ip: '--' }], robots } } };
        }

        // update shadow member
        case actions.UPDATE_SHADOW_MEMBER:
            return { ...state, requestParams: { ...state.requestParams, updateShadowMember: action.payload } };

        case actions.UPDATE_SHADOW_MEMBER_FAIL:
            return { ...state, updateShadowMemberRes: action.payload };

        case actions.UPDATE_SHADOW_MEMBER_SUCCESS: {
            const { memberId, permissions } = state.requestParams.updateShadowMember;

            let { items } = state.getShadowMemberRes.result;

            items = items.map(item => item.id === memberId ? { ...item, permission: permissions.join(',') } : item);

            return { ...state, updateShadowMemberRes: action.payload, getShadowMemberRes: { ...state.getShadowMemberRes, result: { ...state.getShadowMemberRes.result, items } } };
        }


        // delete shadow member
        case actions.DELETE_SHADOW_MEMBER:
            return { ...state, requestParams: { ...state.requestParams, deleteShadowMember: action.payload } };

        case actions.DELETE_SHADOW_MEMBER_FAIL:
            return { ...state, deleteShadowMemberRes: action.payload };

        case actions.DELETE_SHADOW_MEMBER_SUCCESS:
            return { ...state, deleteShadowMemberRes: action.payload, getShadowMemberRes: { ...state.getShadowMemberRes, result: { ...state.getShadowMemberRes.result, items: state.getShadowMemberRes.result.items.filter(item => item.id !== state.requestParams.deleteShadowMember.memberId) } } };

        // lock shadow member
        case actions.LOCK_SHADOW_MEMBER:
            return { ...state, requestParams: { ...state.requestParams, lockShadowMember: action.payload } };

        case actions.LOCK_SHADOW_MEMBER_FAIL:
            return { ...state, lockShadowMemberRes: action.payload };

        case actions.LOCK_SHADOW_MEMBER_SUCCESS: {
            const { memberId, status } = state.requestParams.lockShadowMember;

            return { ...state, lockShadowMemberRes: action.payload, getShadowMemberRes: { ...state.getShadowMemberRes, result: { ...state.getShadowMemberRes.result, items: state.getShadowMemberRes.result.items.map(item => item.id === memberId ? { ...item, status } : item) } } };
        }

        case actions.GET_ACCOUNT:
        case actions.GET_GOOGLE_AUTH_KEY:
        case actions.UNBIND_SNS:
        default:
            return state;
    }
}

export const getChangePasswordRes = (state: State) => state.changePasswordRes;

export const getRequestArgs = (state: State) => state.requestParams;

export const getUIState = (state: State) => state.UIState;

export const getNicknameRes = (state: State) => state.changeNicknameRes;

export const getGoogleAuthKeyRes = (state: State) => state.googleAuthKeyRes;

export const getUnbindSNSRes = (state: State) => state.unbindSNSRes;

export const getBindGoogleAuthRes = (state: State) => state.bindGoogleAuthRes;

export const getAccountRes = (state: State) => state.getAccountRes;

export const getShadowMemberRes = (state: State) => state.getShadowMemberRes;

export const getAddShadowMemberRes = (state: State) => state.addShadowMemberRes;

export const getUpdateShadowMemberRes = (state: State) => state.updateShadowMemberRes;

export const getLockShadowMemberRes = (state: State) => state.lockShadowMemberRes;

export const getDeleteShadowMemberRes = (state: State) => state.deleteShadowMemberRes;
