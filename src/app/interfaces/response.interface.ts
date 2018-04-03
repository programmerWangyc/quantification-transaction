import { Action } from '@ngrx/store';

/* =======================================================Abstract response========================================================= */

export type ResponseItem = string | number | boolean | { [key: string]: any } | JSON;

export interface ResponseState {
    error: string;
    action?: string;
}

export interface ResponseBody extends PublicResponse {
    result: ResponseUnit<ResponseItem>[];
}

export interface ResponseUnit<T> extends ResponseState {
    result: T;
}


/* =======================================================Public section of response========================================================= */

export interface PublicResponse {
    balance: number;
    cached: boolean;
    callbackId: string;
    consumed: number;
    error: string;
    is_admin: boolean;
    notify: number;
    token: string;
    username: string;
    version: number;
}

/* =======================================================Api section of response========================================================= */

// login 
export interface LoginResponse extends ResponseUnit<number> { }

// signup
export interface SignupResponse extends ResponseUnit<number> { }

// get settings
export interface IndexSetting {
    showLogo: string;
}

export interface SettingsResponse extends ResponseUnit<string | IndexSetting> { }

// reset password
export interface ResetPasswordResponse extends ResponseUnit<boolean> { }

// set password
export interface SetPasswordResponse extends ResponseUnit<boolean> { }

// exchange list
export interface ExchangeMetaData {
    desc: string;
    required: boolean;
    type: string;
    name: string;
    label: string;
}

export interface Exchange {
    eid: string;
    id: number;
    logo: string;
    meta: ExchangeMetaData[];
    name: string;
    priority: number;
    website: string;
}

export interface ExchangeListResponse {
    exchanges: Exchange[];
}

export interface GetExchangeListResponse extends ResponseUnit<ExchangeListResponse> { }

// export interface AgreementSettingResponse extends ResponseUnit<string>{ }
// agreement: string;
// about: string;
// api: string;
// promotion: {}
// docker: {}
// brokers: {}

















/* ======================================= */
export interface SomethingResponse extends ResponseUnit<Something> { }

export interface Something {
    all: number;
    strategies: Strategy[];
}

export interface Strategy {
    args: string;
    category: number;
    date: string;
    forked: number;
    hasToken: boolean;
    id: number;
    is_buy: boolean;
    is_owner: boolean;
    language: boolean;
    last_modified: string;
    name: string;
    public: number;
    username: string;
}
/* ======================================= */
