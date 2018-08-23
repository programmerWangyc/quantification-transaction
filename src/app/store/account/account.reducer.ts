import {
    BindGoogleAuthRequest, ChangeNickNameRequest, ChangePasswordRequest, DeleteShadowMemberRequest,
    LockShadowMemberRequest, SaveShadowMemberRequest, GetApiKeyListRequest, CreateApiKeyRequest, LockApiKeyRequest, DeleteApiKeyRequest, GetRegisterCodeRequest
} from '../../interfaces/request.interface';
import {
    BindGoogleAuthResponse, ChangeNickNameResponse, ChangePasswordResponse, DeleteShadowMemberResponse,
    GetAccountResponse, GetGoogleAuthKeyResponse, GetShadowMemberResponse, LockShadowMemberResponse,
    SaveShadowMemberResponse, UnbindSNSResponse, GetApiKeyListResponse, LockApiKeyResponse, DeleteApiKeyResponse, CreateApiKeyResponse, GetRegisterCodeResponse
} from '../../interfaces/response.interface';
import * as actions from './account.action';

export interface RequestParams {
    addShadowMember: SaveShadowMemberRequest;
    apiKeyList: GetApiKeyListRequest;
    bindGoogleAuth: BindGoogleAuthRequest;
    changeNickname: ChangeNickNameRequest;
    changePassword: ChangePasswordRequest;
    createApiKey: CreateApiKeyRequest;
    deleteApiKey: DeleteApiKeyRequest;
    deleteShadowMember: DeleteShadowMemberRequest;
    lockApiKey: LockApiKeyRequest;
    lockShadowMember: LockShadowMemberRequest;
    registerCode: GetRegisterCodeRequest;
    updateShadowMember: SaveShadowMemberRequest;
}

export interface UIState {
    loading: boolean;
}

export interface State {
    UIState: UIState;
    addShadowMemberRes: SaveShadowMemberResponse;
    apiKeyListRes: GetApiKeyListResponse;
    bindGoogleAuthRes: BindGoogleAuthResponse;
    changeNicknameRes: ChangeNickNameResponse;
    changePasswordRes: ChangePasswordResponse;
    createApiKeyRes: CreateApiKeyResponse;
    deleteApiKeyRes: DeleteApiKeyResponse;
    deleteShadowMemberRes: DeleteShadowMemberResponse;
    getAccountRes: GetAccountResponse;
    getShadowMemberRes: GetShadowMemberResponse;
    googleAuthKeyRes: GetGoogleAuthKeyResponse;
    lockApiKeyRes: LockApiKeyResponse;
    lockShadowMemberRes: LockShadowMemberResponse;
    registerCodeRes: GetRegisterCodeResponse;
    requestParams: RequestParams;
    unbindSNSRes: UnbindSNSResponse;
    updateShadowMemberRes: SaveShadowMemberResponse;
}

const initialRequestParams: RequestParams = {
    addShadowMember: null,
    apiKeyList: null,
    bindGoogleAuth: null,
    changeNickname: null,
    changePassword: null,
    createApiKey: null,
    deleteApiKey: null,
    deleteShadowMember: null,
    lockApiKey: null,
    lockShadowMember: null,
    registerCode: null,
    updateShadowMember: null,
};

const initialUIState: UIState = {
    loading: false,
};

const initialState: State = {
    UIState: initialUIState,
    addShadowMemberRes: null,
    apiKeyListRes: null,
    bindGoogleAuthRes: null,
    changeNicknameRes: null,
    changePasswordRes: null,
    createApiKeyRes: null,
    deleteApiKeyRes: null,
    deleteShadowMemberRes: null,
    getAccountRes: null,
    getShadowMemberRes: null,
    googleAuthKeyRes: null,
    lockApiKeyRes: null,
    lockShadowMemberRes: null,
    registerCodeRes: null,
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

        // api key list
        case actions.GET_API_KEY_LIST:
            return { ...state, UIState: { ...state.UIState, loading: true } };

        case actions.GET_API_KEY_LIST_FAIL:
        case actions.GET_API_KEY_LIST_SUCCESS:
            return { ...state, apiKeyListRes: action.payload };

        // create api key
        case actions.CREATE_API_KEY:
            return { ...state, requestParams: { ...state.requestParams, createApiKey: action.payload } };

        case actions.CREATE_API_KEY_FAIL:
            return { ...state, createApiKeyRes: action.payload };

        case actions.CREATE_API_KEY_SUCCESS: {
            const { result } = state.apiKeyListRes;

            return { ...state, createApiKeyRes: action.payload, apiKeyListRes: { ...state.apiKeyListRes, result: [...result, { ...action.payload.result, nonce: NaN, rights: '', status: NaN }] } };
        }

        // lock api key
        case actions.LOCK_API_KEY:
            return { ...state, requestParams: { ...state.requestParams, lockApiKey: action.payload } };

        case actions.LOCK_API_KEY_FAIL:
            return { ...state, lockApiKeyRes: action.payload };

        case actions.LOCK_API_KEY_SUCCESS: {
            const { id, status } = state.requestParams.lockApiKey;

            return { ...state, lockApiKeyRes: action.payload, apiKeyListRes: { ...state.apiKeyListRes, result: state.apiKeyListRes.result.map(item => item.id === id ? { ...item, status } : item) } };
        }

        // delete api key
        case actions.DELETE_API_KEY:
            return { ...state, requestParams: { ...state.requestParams, deleteApiKey: action.payload } };

        case actions.DELETE_API_KEY_FAIL:
            return { ...state, deleteApiKeyRes: action.payload };

        case actions.DELETE_API_KEY_SUCCESS:
            return { ...state, deleteApiKeyRes: action.payload, apiKeyListRes: { ...state.apiKeyListRes, result: state.apiKeyListRes.result.filter(item => item.id !== state.requestParams.deleteApiKey.id) } };

        // get register code
        case actions.GET_REGISTER_CODE:
            return { ...state, requestParams: { ...state.requestParams, registerCode: action.payload } };

        case actions.GET_REGISTER_CODE_FAIL:
        case actions.GET_REGISTER_CODE_SUCCESS:
            return { ...state, registerCodeRes: action.payload };

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

export const getApiKeyListRes = (state: State) => state.apiKeyListRes;

export const getDeleteApiKeyListRes = (state: State) => state.deleteApiKeyRes;

export const getCreateApiKeyListRes = (state: State) => state.createApiKeyRes;

export const getLockApiKeyListRes = (state: State) => state.lockApiKeyRes;

export const getRegisterCodeRes = (state: State) => state.registerCodeRes;
