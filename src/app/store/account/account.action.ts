import { Action } from '@ngrx/store';

import {
    BindGoogleAuthRequest, ChangeNickNameRequest, ChangePasswordRequest, CreateApiKeyRequest, DeleteApiKeyRequest,
    DeleteShadowMemberRequest, GetAccountRequest, GetApiKeyListRequest, GetShadowMemberRequest, LockApiKeyRequest,
    LockShadowMemberRequest, SaveShadowMemberRequest, GetRegisterCodeRequest
} from '../../interfaces/request.interface';
import {
    BindGoogleAuthResponse, ChangeNickNameResponse, ChangePasswordResponse, CreateApiKeyResponse, DeleteApiKeyResponse,
    DeleteShadowMemberResponse, GetAccountResponse, GetApiKeyListResponse, GetGoogleAuthKeyResponse,
    GetShadowMemberResponse, LockApiKeyResponse, LockShadowMemberResponse, SaveShadowMemberResponse, UnbindSNSResponse, GetRegisterCodeResponse
} from '../../interfaces/response.interface';
import { ApiAction } from '../base.action';

// =====================================================Server send event=========================================
//  ===========================================Api action===================================

// modify password orders
enum ChangePasswordOrder {
    oldPassword,
    newPassword,
    length,
}

class ChangePassword extends ApiAction {
    isSingleParams = false;

    command = 'ChangePassword';

    order = ChangePasswordOrder;

    noneParams = false;
}

export const CHANGE_PASSWORD = '[Account] CHANGE_PASSWORD';

export class ChangePasswordRequestAction extends ChangePassword implements Action {
    readonly type = CHANGE_PASSWORD;

    constructor(public payload: ChangePasswordRequest) { super(); }
}

export const CHANGE_PASSWORD_FAIL = '[Account] CHANGE_PASSWORD_FAIL';

export class ChangePasswordFailAction extends ChangePassword implements Action {
    readonly type = CHANGE_PASSWORD_FAIL;

    constructor(public payload: ChangePasswordResponse) { super(); }
}

export const CHANGE_PASSWORD_SUCCESS = '[Account] CHANGE_PASSWORD_SUCCESS';

export class ChangePasswordSuccessAction extends ChangePassword implements Action {
    readonly type = CHANGE_PASSWORD_SUCCESS;

    constructor(public payload: ChangePasswordResponse) { super(); }
}

// modify nickname
class ChangeNickName extends ApiAction {
    isSingleParams = true;

    command = 'ChangeNickName';

    order = null;

    noneParams = false;
}

export const CHANGE_NICKNAME = '[Account] CHANGE_NICKNAME';

export class ChangeNickNameRequestAction extends ChangeNickName implements Action {
    readonly type = CHANGE_NICKNAME;

    constructor(public payload: ChangeNickNameRequest) { super(); }
}

export const CHANGE_NICKNAME_FAIL = '[Account] CHANGE_NICKNAME_FAIL';

export class ChangeNickNameFailAction extends ChangeNickName implements Action {
    readonly type = CHANGE_NICKNAME_FAIL;

    constructor(public payload: ChangeNickNameResponse) { super(); }
}

export const CHANGE_NICKNAME_SUCCESS = '[Account] CHANGE_NICKNAME_SUCCESS';

export class ChangeNickNameSuccessAction extends ChangeNickName implements Action {
    readonly type = CHANGE_NICKNAME_SUCCESS;

    constructor(public payload: ChangeNickNameResponse) { super(); }
}

// google auth key
class GetGoogleAuthKey extends ApiAction {
    isSingleParams = false;

    order = null;

    command = 'GetGoogleAuthKey';

    noneParams = true;
}

export const GET_GOOGLE_AUTH_KEY = '[Account] GET_GOOGLE_AUTH_KEY';

export class GetGoogleAuthKeyRequestAction extends GetGoogleAuthKey implements Action {
    readonly type = GET_GOOGLE_AUTH_KEY;

    constructor(public payload = null) { super(); }
}

export const GET_GOOGLE_AUTH_KEY_FAIL = '[Account] GET_GOOGLE_AUTH_KEY_FAIL';

export class GetGoogleAuthKeyFailAction extends GetGoogleAuthKey implements Action {
    readonly type = GET_GOOGLE_AUTH_KEY_FAIL;

    constructor(public payload: GetGoogleAuthKeyResponse) { super(); }
}

export const GET_GOOGLE_AUTH_KEY_SUCCESS = '[Account] GET_GOOGLE_AUTH_KEY_SUCCESS';

export class GetGoogleAuthKeySuccessAction extends GetGoogleAuthKey implements Action {
    readonly type = GET_GOOGLE_AUTH_KEY_SUCCESS;

    constructor(public payload: GetGoogleAuthKeyResponse) { super(); }
}

// unbind sns
class UnbindSNS extends ApiAction {
    isSingleParams = false;

    order = null;

    command = 'UnbindSNS';

    noneParams = true;
}

export const UNBIND_SNS = '[Account] UNBIND_SNS';

export class UnbindSNSRequestAction extends UnbindSNS implements Action {
    readonly type = UNBIND_SNS;

    constructor(public payload = null) { super(); }
}

export const UNBIND_SNS_FAIL = '[Account] UNBIND_SNS_FAIL';

export class UnbindSNSFailAction extends UnbindSNS implements Action {
    readonly type = UNBIND_SNS_FAIL;

    constructor(public payload: UnbindSNSResponse) { super(); }
}

export const UNBIND_SNS_SUCCESS = '[Account] UNBIND_SNS_SUCCESS';

export class UnbindSNSSuccessAction extends UnbindSNS implements Action {
    readonly type = UNBIND_SNS_SUCCESS;

    constructor(public payload: UnbindSNSResponse) { super(); }
}

// bind google verify key
enum BindGoogleAuthOrder {
    code,
    key,
    length,
}

export class BindGoogleAuth extends ApiAction {
    isSingleParams = false;

    order = BindGoogleAuthOrder;

    command = 'BindGoogleAuth';

    noneParams = false;
}

export const BIND_GOOGLE_AUTH = '[Account] BIND_GOOGLE_AUTH';

export class BindGoogleAuthRequestAction extends BindGoogleAuth implements Action {
    readonly type = BIND_GOOGLE_AUTH;

    constructor(public payload: BindGoogleAuthRequest) { super(); }
}

export const BIND_GOOGLE_AUTH_FAIL = '[Account] BIND_GOOGLE_AUTH_FAIL';

export class BindGoogleAuthFailAction extends BindGoogleAuth implements Action {
    readonly type = BIND_GOOGLE_AUTH_FAIL;

    constructor(public payload: BindGoogleAuthResponse) { super(); }
}

export const BIND_GOOGLE_AUTH_SUCCESS = '[Account] BIND_GOOGLE_AUTH_SUCCESS';

export class BindGoogleAuthSuccessAction extends BindGoogleAuth implements Action {
    readonly type = BIND_GOOGLE_AUTH_SUCCESS;

    constructor(public payload: BindGoogleAuthResponse) { super(); }
}

// get shadow member
class GetShadowMember extends ApiAction {
    isSingleParams = false;

    command = 'GetShadowMember';

    order = null;

    noneParams = true;
}

export const GET_SHADOW_MEMBER = '[Account] GET_SHADOW_MEMBER';

export class GetShadowMemberRequestAction extends GetShadowMember implements Action {
    readonly type = GET_SHADOW_MEMBER;

    constructor(public payload: GetShadowMemberRequest = null) { super(); }
}

export const GET_SHADOW_MEMBER_FAIL = '[Account] GET_SHADOW_MEMBER_FAIL';

export class GetShadowMemberFailAction extends GetShadowMember implements Action {
    readonly type = GET_SHADOW_MEMBER_FAIL;

    constructor(public payload: GetShadowMemberResponse) { super(); }
}

export const GET_SHADOW_MEMBER_SUCCESS = '[Account] GET_SHADOW_MEMBER_SUCCESS';

export class GetShadowMemberSuccessAction extends GetShadowMember implements Action {
    readonly type = GET_SHADOW_MEMBER_SUCCESS;

    constructor(public payload: GetShadowMemberResponse) { super(); }
}

// add shadow member
enum SaveShadowMemberOrder {
    memberId,
    username,
    password,
    permissions,
    length,
}

class SaveShadowMember extends ApiAction {
    isSingleParams = false;

    command = 'SaveShadowMember';

    noneParams = false;

    order = SaveShadowMemberOrder;
}

class AddShadowMember extends SaveShadowMember {
    callbackId = 'AddShadowMember';
}

export const ADD_SHADOW_MEMBER = '[Account] ADD_SHADOW_MEMBER';

export class AddShadowMemberRequestAction extends AddShadowMember implements Action {
    readonly type = ADD_SHADOW_MEMBER;

    constructor(public payload: SaveShadowMemberRequest) { super(); }
}

export const ADD_SHADOW_MEMBER_FAIL = '[Account] ADD_SHADOW_MEMBER_FAIL';

export class AddShadowMemberFailAction extends AddShadowMember implements Action {
    readonly type = ADD_SHADOW_MEMBER_FAIL;

    constructor(public payload: SaveShadowMemberResponse) { super(); }
}

export const ADD_SHADOW_MEMBER_SUCCESS = '[Account] ADD_SHADOW_MEMBER_SUCCESS';

export class AddShadowMemberSuccessAction extends AddShadowMember implements Action {
    readonly type = ADD_SHADOW_MEMBER_SUCCESS;

    constructor(public payload: SaveShadowMemberResponse) { super(); }
}

// update shadow member
class UpdateShadowMember extends SaveShadowMember {
    callbackId = 'UpdateShadowMember';
}

export const UPDATE_SHADOW_MEMBER = '[Account] UPDATE_SHADOW_MEMBER';

export class UpdateShadowMemberRequestAction extends UpdateShadowMember implements Action {
    readonly type = UPDATE_SHADOW_MEMBER;

    constructor(public payload: SaveShadowMemberRequest) { super(); }
}

export const UPDATE_SHADOW_MEMBER_FAIL = '[Account] UPDATE_SHADOW_MEMBER_FAIL';

export class UpdateShadowMemberFailAction extends UpdateShadowMember implements Action {
    readonly type = UPDATE_SHADOW_MEMBER_FAIL;

    constructor(public payload: SaveShadowMemberResponse) { super(); }
}

export const UPDATE_SHADOW_MEMBER_SUCCESS = '[Account] UPDATE_SHADOW_MEMBER_SUCCESS';

export class UpdateShadowMemberSuccessAction extends UpdateShadowMember implements Action {
    readonly type = UPDATE_SHADOW_MEMBER_SUCCESS;

    constructor(public payload: SaveShadowMemberResponse) { super(); }
}

// delete shadow member
export class DeleteShadowMember extends ApiAction {
    isSingleParams = true;

    command = 'DeleteShadowMember';

    noneParams = false;

    order = null;
}

export const DELETE_SHADOW_MEMBER = '[Account] DELETE_SHADOW_MEMBER';

export class DeleteShadowMemberRequestAction extends DeleteShadowMember implements Action {
    readonly type = DELETE_SHADOW_MEMBER;

    constructor(public payload: DeleteShadowMemberRequest) { super(); }
}

export const DELETE_SHADOW_MEMBER_FAIL = '[Account] DELETE_SHADOW_MEMBER_FAIL';

export class DeleteShadowMemberFailAction extends DeleteShadowMember implements Action {
    readonly type = DELETE_SHADOW_MEMBER_FAIL;

    constructor(public payload: DeleteShadowMemberResponse) { super(); }
}

export const DELETE_SHADOW_MEMBER_SUCCESS = '[Account] DELETE_SHADOW_MEMBER_SUCCESS';

export class DeleteShadowMemberSuccessAction extends DeleteShadowMember implements Action {
    readonly type = DELETE_SHADOW_MEMBER_SUCCESS;

    constructor(public payload: DeleteShadowMemberResponse) { super(); }
}

// update shadow member
enum LockShadowMemberOrder {
    memberId,
    status,
    length,
}

export class LockShadowMember extends ApiAction {
    isSingleParams = false;

    command = 'LockShadowMember';

    noneParams = false;

    order = LockShadowMemberOrder;
}

export const LOCK_SHADOW_MEMBER = '[Account] LOCK_SHADOW_MEMBER';

export class LockShadowMemberRequestAction extends LockShadowMember implements Action {
    readonly type = LOCK_SHADOW_MEMBER;

    constructor(public payload: LockShadowMemberRequest) { super(); }
}

export const LOCK_SHADOW_MEMBER_FAIL = '[Account] LOCK_SHADOW_MEMBER_FAIL';

export class LockShadowMemberFailAction extends LockShadowMember implements Action {
    readonly type = LOCK_SHADOW_MEMBER_FAIL;

    constructor(public payload: LockShadowMemberResponse) { super(); }
}

export const LOCK_SHADOW_MEMBER_SUCCESS = '[Account] LOCK_SHADOW_MEMBER_SUCCESS';

export class LockShadowMemberSuccessAction extends LockShadowMember implements Action {
    readonly type = LOCK_SHADOW_MEMBER_SUCCESS;

    constructor(public payload: LockShadowMemberResponse) { super(); }
}

// get account
export class GetAccount extends ApiAction {
    isSingleParams = false;

    command = 'GetAccount';

    noneParams = true;

    order = null;
}

export const GET_ACCOUNT = '[Account] GET_ACCOUNT';

export class GetAccountRequestAction extends GetAccount implements Action {
    readonly type = GET_ACCOUNT;

    constructor(public payload: GetAccountRequest = null) { super(); }
}

export const GET_ACCOUNT_FAIL = '[Account] GET_ACCOUNT_FAIL';

export class GetAccountFailAction extends GetAccount implements Action {
    readonly type = GET_ACCOUNT_FAIL;

    constructor(public payload: GetAccountResponse) { super(); }
}

export const GET_ACCOUNT_SUCCESS = '[Account] GET_ACCOUNT_SUCCESS';

export class GetAccountSuccessAction extends GetAccount implements Action {
    readonly type = GET_ACCOUNT_SUCCESS;

    constructor(public payload: GetAccountResponse) { super(); }
}

// get api key list
export class GetApiKeyList extends ApiAction {
    isSingleParams = false;

    command = 'GetApiKeyList';

    noneParams = true;

    order = null;
}

export const GET_API_KEY_LIST = '[Account] GET_API_KEY_LIST';

export class GetApiKeyListRequestAction extends GetApiKeyList implements Action {
    readonly type = GET_API_KEY_LIST;

    constructor(public payload: GetApiKeyListRequest = null) { super(); }
}

export const GET_API_KEY_LIST_FAIL = '[Account] GET_API_KEY_LIST_FAIL';

export class GetApiKeyListFailAction extends GetApiKeyList implements Action {
    readonly type = GET_API_KEY_LIST_FAIL;

    constructor(public payload: GetApiKeyListResponse) { super(); }
}

export const GET_API_KEY_LIST_SUCCESS = '[Account] GET_API_KEY_LIST_SUCCESS';

export class GetApiKeyListSuccessAction extends GetApiKeyList implements Action {
    readonly type = GET_API_KEY_LIST_SUCCESS;

    constructor(public payload: GetApiKeyListResponse) { super(); }
}

// create api key
enum CreateApiKeyOrder {
    ip,
    permission,
    length,
}

export class CreateApiKey extends ApiAction {
    isSingleParams = false;

    command = 'CreateApiKey';

    noneParams = false;

    order = CreateApiKeyOrder;
}

export const CREATE_API_KEY = '[Account] CREATE_API_KEY';

export class CreateApiKeyRequestAction extends CreateApiKey implements Action {
    readonly type = CREATE_API_KEY;

    constructor(public payload: CreateApiKeyRequest) { super(); }
}

export const CREATE_API_KEY_FAIL = '[Account] CREATE_API_KEY_FAIL';

export class CreateApiKeyFailAction extends CreateApiKey implements Action {
    readonly type = CREATE_API_KEY_FAIL;

    constructor(public payload: CreateApiKeyResponse) { super(); }
}

export const CREATE_API_KEY_SUCCESS = '[Account] CREATE_API_KEY_SUCCESS';

export class CreateApiKeySuccessAction extends CreateApiKey implements Action {
    readonly type = CREATE_API_KEY_SUCCESS;

    constructor(public payload: CreateApiKeyResponse) { super(); }
}

// lock api key
export class LockApiKey extends ApiAction {
    isSingleParams = true;

    command = 'LockApiKey';

    noneParams = false;

    order = null;
}

export const LOCK_API_KEY = '[Account] LOCK_API_KEY';

export class LockApiKeyRequestAction extends LockApiKey implements Action {
    readonly type = LOCK_API_KEY;

    constructor(public payload: LockApiKeyRequest) { super(); }
}

export const LOCK_API_KEY_FAIL = '[Account] LOCK_API_KEY_FAIL';

export class LockApiKeyFailAction extends LockApiKey implements Action {
    readonly type = LOCK_API_KEY_FAIL;

    constructor(public payload: LockApiKeyResponse) { super(); }
}

export const LOCK_API_KEY_SUCCESS = '[Account] LOCK_API_KEY_SUCCESS';

export class LockApiKeySuccessAction extends LockApiKey implements Action {
    readonly type = LOCK_API_KEY_SUCCESS;

    constructor(public payload: LockApiKeyResponse) { super(); }
}

// delete api key
export class DeleteApiKey extends ApiAction {
    isSingleParams = true;

    command = 'DeleteApiKey';

    noneParams = false;

    order = null;
}

export const DELETE_API_KEY = '[Account] DELETE_API_KEY';

export class DeleteApiKeyRequestAction extends DeleteApiKey implements Action {
    readonly type = DELETE_API_KEY;

    constructor(public payload: DeleteApiKeyRequest) { super(); }
}

export const DELETE_API_KEY_FAIL = '[Account] DELETE_API_KEY_FAIL';

export class DeleteApiKeyFailAction extends DeleteApiKey implements Action {
    readonly type = DELETE_API_KEY_FAIL;

    constructor(public payload: DeleteApiKeyResponse) { super(); }
}

export const DELETE_API_KEY_SUCCESS = '[Account] DELETE_API_KEY_SUCCESS';

export class DeleteApiKeySuccessAction extends DeleteApiKey implements Action {
    readonly type = DELETE_API_KEY_SUCCESS;

    constructor(public payload: DeleteApiKeyResponse) { super(); }
}

// get register code
enum GetRegisterCodeOrder {
    offset,
    limit,
    magic1,
    length,
}

export class GetRegisterCode extends ApiAction {
    isSingleParams = false;

    noneParams = false;

    command = 'GetTokens';

    callbackId = 'GetRegisterCode';

    order = GetRegisterCodeOrder;
}

export const GET_REGISTER_CODE = '[Account] GET_REGISTER_CODE';

export class GetRegisterCodeRequestAction extends GetRegisterCode implements Action {
    readonly type = GET_REGISTER_CODE;

    constructor(public payload: GetRegisterCodeRequest) { super(); }
}

export const GET_REGISTER_CODE_FAIL = '[Account] GET_REGISTER_CODE_FAIL';

export class GetRegisterCodeFailAction extends GetRegisterCode implements Action {
    readonly type = GET_REGISTER_CODE_FAIL;

    constructor(public payload: GetRegisterCodeResponse) { super(); }
}

export const GET_REGISTER_CODE_SUCCESS = '[Account] GET_REGISTER_CODE_SUCCESS';

export class GetRegisterCodeSuccessAction extends GetRegisterCode implements Action {
    readonly type = GET_REGISTER_CODE_SUCCESS;

    constructor(public payload: GetRegisterCodeResponse) { super(); }
}


//  ===========================================Local action===================================

export const RESET_ACCOUNT = '[Account] RESET_ACCOUNT';

export class ResetAccountAction implements Action {
    readonly type = RESET_ACCOUNT;
}

export type ApiActions = ChangePasswordRequestAction
    | AddShadowMemberFailAction
    | AddShadowMemberRequestAction
    | AddShadowMemberSuccessAction
    | BindGoogleAuthFailAction
    | BindGoogleAuthRequestAction
    | BindGoogleAuthSuccessAction
    | ChangeNickNameFailAction
    | ChangeNickNameRequestAction
    | ChangeNickNameSuccessAction
    | ChangePasswordFailAction
    | ChangePasswordSuccessAction
    | CreateApiKeyFailAction
    | CreateApiKeyRequestAction
    | CreateApiKeySuccessAction
    | DeleteApiKeyFailAction
    | DeleteApiKeyRequestAction
    | DeleteApiKeySuccessAction
    | DeleteShadowMemberFailAction
    | DeleteShadowMemberRequestAction
    | DeleteShadowMemberSuccessAction
    | GetAccountFailAction
    | GetAccountRequestAction
    | GetAccountSuccessAction
    | GetApiKeyListFailAction
    | GetApiKeyListRequestAction
    | GetApiKeyListSuccessAction
    | GetGoogleAuthKeyFailAction
    | GetGoogleAuthKeyRequestAction
    | GetGoogleAuthKeySuccessAction
    | GetRegisterCodeFailAction
    | GetRegisterCodeRequestAction
    | GetRegisterCodeSuccessAction
    | GetShadowMemberFailAction
    | GetShadowMemberRequestAction
    | GetShadowMemberSuccessAction
    | LockApiKeyFailAction
    | LockApiKeyRequestAction
    | LockApiKeySuccessAction
    | LockShadowMemberFailAction
    | LockShadowMemberRequestAction
    | LockShadowMemberSuccessAction
    | UnbindSNSFailAction
    | UnbindSNSRequestAction
    | UnbindSNSSuccessAction
    | UpdateShadowMemberFailAction
    | UpdateShadowMemberRequestAction
    | UpdateShadowMemberSuccessAction;

export type Actions = ApiActions
    | ResetAccountAction;

export const ResponseActions = {
    AddShadowMemberFailAction,
    AddShadowMemberSuccessAction,
    BindGoogleAuthFailAction,
    BindGoogleAuthSuccessAction,
    ChangeNickNameFailAction,
    ChangeNickNameSuccessAction,
    ChangePasswordFailAction,
    ChangePasswordSuccessAction,
    CreateApiKeyFailAction,
    CreateApiKeySuccessAction,
    DeleteApiKeyFailAction,
    DeleteApiKeySuccessAction,
    DeleteShadowMemberFailAction,
    DeleteShadowMemberSuccessAction,
    GetAccountFailAction,
    GetAccountSuccessAction,
    GetApiKeyListFailAction,
    GetApiKeyListSuccessAction,
    GetGoogleAuthKeyFailAction,
    GetGoogleAuthKeySuccessAction,
    GetRegisterCodeFailAction,
    GetRegisterCodeSuccessAction,
    GetShadowMemberFailAction,
    GetShadowMemberSuccessAction,
    LockApiKeyFailAction,
    LockApiKeySuccessAction,
    LockShadowMemberFailAction,
    LockShadowMemberSuccessAction,
    UnbindSNSFailAction,
    UnbindSNSSuccessAction,
    UpdateShadowMemberFailAction,
    UpdateShadowMemberSuccessAction,
};
