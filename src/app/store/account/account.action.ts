import { Action } from '@ngrx/store';

import {
    BindGoogleAuthRequest, ChangeNickNameRequest, ChangePasswordRequest, DeleteShadowMemberRequest, GetAccountRequest,
    GetShadowMemberRequest, LockShadowMemberRequest, SaveShadowMemberRequest
} from '../../interfaces/request.interface';
import {
    BindGoogleAuthResponse, ChangeNickNameResponse, ChangePasswordResponse, DeleteShadowMemberResponse,
    GetAccountResponse, GetGoogleAuthKeyResponse, GetShadowMemberResponse, LockShadowMemberResponse,
    SaveShadowMemberResponse, UnbindSNSResponse
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
    | DeleteShadowMemberFailAction
    | DeleteShadowMemberRequestAction
    | DeleteShadowMemberSuccessAction
    | GetAccountFailAction
    | GetAccountRequestAction
    | GetAccountSuccessAction
    | GetGoogleAuthKeyFailAction
    | GetGoogleAuthKeyRequestAction
    | GetGoogleAuthKeySuccessAction
    | GetShadowMemberFailAction
    | GetShadowMemberRequestAction
    | GetShadowMemberSuccessAction
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
    DeleteShadowMemberFailAction,
    DeleteShadowMemberSuccessAction,
    GetAccountFailAction,
    GetAccountSuccessAction,
    GetGoogleAuthKeyFailAction,
    GetGoogleAuthKeySuccessAction,
    GetShadowMemberFailAction,
    GetShadowMemberSuccessAction,
    LockShadowMemberFailAction,
    LockShadowMemberSuccessAction,
    UnbindSNSFailAction,
    UnbindSNSSuccessAction,
    UpdateShadowMemberFailAction,
    UpdateShadowMemberSuccessAction,
};
