
//setting
export const settings = 'GetSettings';

export interface GetSettings {
    name: string;
}

export enum Settings {
    about = 'about',
    agreement = 'agreement',
    api = 'api',
    promotion = 'promotion',
    docker = 'docker',
    brokers = 'brokers'
}

//plane list
export const getBBSPlaneList = 'GetBBSPlaneList';

export interface GetBBSPlaneList {
    list: any[];
}

// bbs node list
export const getBBSNodeList = 'GetBBSNodeList';

export interface GetBBSNodeList {
    list: any[];
}

// topic
export const getBBSTopic = 'GetBBSTopic';

export interface GetBBSTopic {
    id: number;
}

export const addBBSTopic = 'AddBBSTopic';

export interface AddTopic {
    topicId: number;
    nodeNumber: number;
    title: string;
    content: string;
}

export const deleteBBSTopic = 'M_Topic';

export interface DeleteTopic {
    topicId: number;
    magic1: number;
    magic2: number;
}

export const getBBSTopicListBySlug = 'GetBBSTopicListBySlug';

export interface GetBBSTopicListBySlug {
    slug: string;
    total: number;
    pageSize: number;
    keyword: string;
}

// qiniu token
export const getQiniuToken = 'GetQiniuToken';

export interface QiniuToken {
    name: string;
}

// lock user
export const LockUser = 'M_User';

export interface LockUser {
    id: number;
    magic1: number;
    magic2: number;
}

// compentition list
export const getCompetitionList = 'GetCompetitionList';

export interface GetCompetitionList {
    startTime: string; // const YY-MM-01 00: 00: 00;
    endTime: string; // const YY-MM-DD 22: 00: 00;
}

// disable two factor
export const disableTwofactor = 'DisableTwofactor';

export interface DisableTwofactor {
    token: string;
}

// robot
export const getPublicRobotList = 'GetPublicRobotList';

export interface GetPublicRobotList {
    magic1: number;
    magic2: number;
    magic3: number;
}

export const getPublicRobot = 'PublicRobot';

export interface GetPublicRobot {
    id: number;
    type: string;
}

export const stopRobot = 'StopRobot';

export interface StopRobot {
    id: number;
}

export const restartRobot = 'RestartRobot';

export interface RestartRobot {
    id: number;
}

export const deleteRobot = 'DeleteRobot';

export interface DeleteRobot {
    id: number;
    checked: boolean;
}

export const getRobotDetail = 'GetRobotDetail';

export interface GetRobotDetail {
    id: number;
}

export const modifyRobot = 'ModifyRobot';

export interface ModifyRobot {
    id: number;
    name: number;
    nodeId: number;
    ktickId: number;
    pairExchanges: number[];
    pairStocks: string[];
    magic1: string[];
}

export const getRobotLogs = 'GetRobotLogs';

export interface GetRobotLogs {
    robotId: number;
    // table Log
    logMinId: number;
    logMaxId: number;
    logOffset: number;
    logLimit: number;
    // table Profit
    profitMinId: number;
    profitMaxId: number;
    profitOffset: number;
    profitLimit: number;
    // table Chart
    chartMinId: number;
    chartMaxId: number;
    chartOffset: number;
    chartLimit: number;
    chartUpdateBaseId: number;
    chartUpdateTime: number;
}

export const subscribeRobot = 'SubscribeRobot';

export interface SubscribeRobot {
    id: number;
}

export const CommandRobot = 'CommandRobot';

export interface CommandRobot {
    id: number;
    command: string;
}

// login
export const login = 'Login';

export interface Login {
    username: string;
    password: string; // encoded password;
    magic1: string;
}

export interface CommonDelete {
    id: number;
}

// notify
export const deleteNotify = 'DeleteNotify';

export interface DeleteNotify extends CommonDelete { }

export const getBBSNotify = 'GetBBSNotify';

export interface GetBBSNotify {
    magic1: number;
    magic2: number;
}

// message
export const deleteMessage = 'DeleteMessage';

export interface DeleteMessage extends CommonDelete { }

export const deleteAPMMessage = 'DeleteAPMMessage';

export interface DeleteAPMMessage extends CommonDelete { }

// push queue
export const GetPushQueue = 'getPushQueue';

export interface GetPushQueue {
    magic1: number;
    magic2: number;
}

// apm queue
export const getAPMQueue = 'GetAPMQueue'

export interface GetAPMQueue {
    magic1: number;
    magic2: number;
}

// google auth key
export const getGoogleAuthKey = 'GetGoogleAuthKey';

export interface GetGoogleAuthKey {

}

export const getBindGoogleAuth = 'BindGoogleAuth';

export interface GetBindGoogleAuth {
    code: string;
    key: string;
}

// shadow member 
export const getShadowMember = 'GetShadowMember';

export interface GetShadowMember {

}

export const addShadowMember = 'SaveShadowMember';

export interface AddShadowMember {
    memberId: number;
    username: string;
    password: string;
    permissionList: number[];
}

export const deleteShadowMember = 'DeleteShadowMember';

export interface DeleteShadowMember {
    memberId: number;
}

export const updateShadowMember = 'LockShadowMember';

export interface UpdateShadowMember {
    memberId: number;
    status: number;
}

// account 
export const getAccount = 'GetAccount';

export interface GetAccount {

}

// api key list
export const getApiKeyList = 'GetApiKeyList';

export interface GetApiKeyList {

}

// SNS
export const getUnbindSNS = 'UnbindSNS'

export interface GetUnbindSNS {

}

// change nick name
export const getChangeNickName = 'ChangeNickName';

export interface getChangeNickName {
    name: string;
}

// change pass word

export const getChangePassword = 'ChangePassword';

export interface getChangePassword {
    oldPassword: string;
    newPassword: string;
}

// api key 

export const addApiKey = 'CreateApiKey';

export interface AddApiKey {
    magic1: string;
    magic2: string;
}

export const updateApiKey = 'LockApiKey';

export interface UpdateApiKey {
    id: number;
    status: number;
}

export const deleteApiKey = 'DeleteApiKey';

export interface DeleteApiKey extends CommonDelete { }

// node hash
export const getNodeHash = 'GetNodeHash';

export interface GetNodeHash {

}

// platform 
export const getPlatformDetail = 'GetPlatformDetail';

export interface GetPlatformDetail {
    platoformId: number;
}

export const getPlatformList = 'GetPlatformList';

export interface GetPlatformList {

}

export const updatePlatform = 'SavePlatform';

export interface UpdatePlatform {
    platformId: number;
    exchangeId: number;
    dic: string; // json
    magic1: string;
    label: string;
}

export const deletePlatform = 'DeletePlatform';

export interface DeletePlatform {
    platformId: number;
}

// exchange list
export const getExchangeList = 'GetExchangeList'

export interface GetExchangeList {

}

// strategy list
export const getStrategyList = 'GetStrategyList';

export interface GetStrategyList {
    magic1: number;
    magic2: number;
    magic3: number;
    magic4: number;
    magic5: number;
}

export const getStrategyListByName = 'GetStrategyListByName';

export interface GetStrategyListByName {
    count: number;
    pageSize: number;
    magic1: number;
    categoryId: number;
    magic2: number;
    keyword: string;
}

// node list
export const getNodeList = 'GetNodeList';

export interface GetNodeList {

}

export const deleteNode = 'DeleteNode';

export interface DeleteNode {
    nodeId: number;
}

// robot
export const updateRobot = 'SaveRobot';

export interface UpdateRobot {
    name: string;
    magic1: string;
    strategyId: number;
    ktickId: number;
    pairExchanges: number[];
    pairStocks: string[]; // string ? number?
    nodeId: number;
}

// backtest IO
export const getBacktestIO = 'getBacktestIO';

export interface GetBacktestIO {
    nodeId: number;
    typeId: number;
    dic: string // [] JSON.stringfiy array [ string, uuid ];
}

export enum BacktestDescription {
    deleteTask = 'DelTask',
    getTaskStatus = 'GetTaskStatus',
    getTaskResult = 'GetTaskResult',
    putTask = 'PutTask',
    stopTask = 'StopTask'
}

// strategy token
export const opStrategyToken = 'OpStrategyToken'

export interface OpStrategyToken {
    id: number;
    code: number;
}

// get strategy detail
export const getStrategyDetail = 'GetStrategyDetail'

export interface GetStrategyDetail {
    strategyId: number;
}

export const updateStrategy = 'SaveStrategy';

export interface UpdateStrategy {
    strategyId: number;
    categoryId: number;
    codeTypeId: number;
    scriptName: string;
    description: string;
    argsJson: string;
    source: string;
    scriptNode: string;
    scriptManual: string;
    depends: string;
}

export const shareStrategy = 'ShareStrategy';

export interface ShareStrategy {
    strategyId: number;
    typeId: number;
}

export const deleteStrategy = 'DeleteStrategy';

export interface DeleteStrategy {
    strategyId: number;
}

export const getPublicStrategyDetail = 'GetPublicStrategyDetail';

export interface GetPublicStrategyDetail {
    strategyId: number;
}

// templates
export const getTemplates = 'GetTemplates';

export interface GetTemplates {
    ids: number[];
}

// broadcast
export const setBroadcast = 'SetBroadcast';

export interface SetBroadcast {
    id: number;
}

export const getBroadcast = 'GetBroadcast';

export interface GetBroadcast {
    count: number;
}

// watch dog
export const setRobotWD = 'SetRobotWD';

export interface SetRobotWD {
    id: number;
    watchDogStatus: number;
}

export const setNodeWD = 'SetNodeWD';

export interface SetNodeWD {
    id: number;
    watchDogStatus: number;
}

// verify key 
export const verifyKey = 'VerifyKey';

export interface VerifyKey {
    id: number;
    scode: number;
}

// get key
export const getGenKey = 'GetGenKey';

export interface GetGenKey {
    magic1: number;
    id: number;
    days: number;
    maxConcurrent: number;
}

// payment
export const getPaymentArg = 'GetPaymentArg';

export interface GetPaymentArg {
    method: number;
    magic1: number;
    pricingAmount: number;
}

export const getPayOrders = 'GetPayOrders';

export interface GetPayOrders { }

// trade
export const getTradeHistory = 'GetTradeHistory';

export interface GetTradeHistory {
    magic1: number[];
}

export const updateTradeHistory = 'SaveTradeHistory';

export interface UpdateTradeHistory {
    id: number;
    expire: string;
    concurrent: number;
}

// sandbox
export const getSandBoxToken = 'GetSandBoxToken';

export interface GetSandBoxToken { }

// Stats
export const getStats = 'GetStats';

export interface GetStats {
    code: number;
}

// priority
export const setClusterPriority = 'SetClusterPriority';

export interface SetClusterPriority {
    magic1: number[];
}

// password
export const resetPassword = 'ResetPassword';

export interface ResetPassword {
    email: string;
}

export const SetPassword = 'SetPassword';

export interface SetPassword {
    token: string;
    password: string;
}

// reset two factor
export const resetTwofactor = 'ResetTwofactor';

export interface ResetTwofactor {
    username: string;
    password: string;
    emmail: string;
}

// csp report
export const getCSPReport = 'CSPReport';

export interface GetCSPReport {
    magic1: string[];
}

// signup
export const signup = 'Signup';

export interface Signup {
    username: string;
    email: string;
    password: string; // crypted password.
    refUser: string;
    refUrl: string;
}

// M_Public
export const getM_Public = 'M_Public';

export interface GetM_Public {
    id: number;
    magic1: number;
    magic2: number;
}

// comment
export const submitComment = 'SubmitComment';

export interface SubmitComment {
    topic: number;
    content: string;
    replyId: number;
    subReplyId: number;
    commentId: number;
}

export const GetCommentList = 'GetCommentList';

export interface GetCommentList {
    topic: number;
    magic1: string;
    magic2: string;
}

// verify password
export const verifyPassword = 'VerifyPassword';

export interface VerifyPassword {
    password: string;
}
