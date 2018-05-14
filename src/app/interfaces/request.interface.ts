
export interface WsRequest {
    method: string[];
    params: any[][];
}

/** ===================================================Auth========================================= **/

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

// reset password
export interface ResetPasswordRequest {
    email: string;
}

// set password
export interface SetPasswordRequest {
    token: string;
    password: string;
}

// verify password
export interface VerifyPasswordRequest {
    password: string; 
}

/** ===================================================Setting========================================= **/

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

/** ===================================================Exchange========================================= **/

// exchange list
export interface GetExchangeListRequest { }

/** ===================================================Robot========================================= **/

// robot list
export interface GetRobotListRequest {
    start: number; // 查询的起始位置
    limit: number; // 每次查询的数量
    status: number; // 机器人的状态
}

// public robot
export interface PublicRobotRequest {
    id: number;
    type: number; // 0 放弃公开 1 公开
}

// robot detail 
export interface GetRobotDetailRequest {
    id: number;
}

// robot logs
export interface GetRobotLogsRequest {
    robotId: number;
    // Log
    logMinId: number;
    logMaxId: number;
    // 查询起点位置，和传page其实一样，只不过用这种方式需要前台把这个值计算出来，比如当前limit === 20, 当前页是3，那么查询下一页时这个值就应该是60;
    logOffset: number; 
    logLimit: number; 
    // Profit
    profitMinId: number;
    profitMaxId: number;
    profitOffset: number;
    profitLimit: number;
    // Chart
    chartMinId: number;
    chartMaxId: number;
    chartOffset: number;
    chartLimit: number;
    chartUpdateBaseId: number;
    chartUpdateTime: number;
}

// subscribe robot
export interface SubscribeRobotRequest {
    id: number;
}

// restart robot
export interface RestartRobotRequest {
    id: number;
}

// stop robot
export interface StopRobotRequest {
    id: number;
}

// modify robot config
export interface ModifyRobotRequest {
    id: number;
    name: string;
    nodeId: number;
    kLinePeriodId: number;
    platform: number[];
    stocks: string[];
    args: string;
}

// command robot
export interface CommandRobotRequest {
    id: number;
    command: string;
}

/** ===================================================Node list========================================= **/

export const getNodeList = 'GetNodeList';

export interface GetNodeListRequest { }

/** ===================================================Platform list========================================= **/

export interface GetPlatformListRequest { }

/** ===================================================Watch dog========================================= **/

// robot watch dog
export interface SetRobotWDRequest {
    robotId: number;
    watchDogStatus: number;
}

/**
 * 接口总数： 83， 已完成： 19
 */