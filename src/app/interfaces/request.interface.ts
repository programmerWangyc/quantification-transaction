
//requrest interface
export interface WsRequest {
    method: string[];
    params: any[][];
}

// login
export interface LoginRequest {
    username: string;
    password: string; // encoded password;
    secondaryVerificationCode?: string; // google  secondary verification code  
}

// signup
export interface SignupRequest {
    username: string;
    email: string;
    password: string; // encoded password;
    refUser: string; // referrer
    refUrl: string;
}

// get settings
export enum SettingTypes {
    about = 'about',
    agreement = 'agreement',
    api = 'api',
    promotion = 'promotion',
    docker = 'docker',
    brokers = 'brokers',
    index = 'index'
}

export interface SettingsRequest {
    type: string;
}