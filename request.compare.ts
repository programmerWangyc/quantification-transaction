
//setting
const settings = 'GetSettings';

interface GetSettings {
    name: string;
}

enum Settings {
    about = 'about',
    agreement = 'agreement',
    api = 'api',
    promotion = 'promotion',
    docker = 'docker',
    brokers = 'brokers',
    javaScript = 'backtest_javascript',
    index = 'index'
}

//plane list
const getBBSPlaneList = 'GetBBSPlaneList';

interface GetBBSPlaneList {
    list: any[];
}

// bbs node list
const getBBSNodeList = 'GetBBSNodeList';

interface GetBBSNodeList {
    list: any[];
}

// topic
const getBBSTopic = 'GetBBSTopic';

interface GetBBSTopic {
    id: number;
}

const addBBSTopic = 'AddBBSTopic';

interface AddTopic {
    topicId: number;
    nodeNumber: number;
    title: string;
    content: string;
}

const deleteBBSTopic = 'M_Topic';

interface DeleteTopic {
    topicId: number;
    magic1: number;
    magic2: number;
}

const getBBSTopicListBySlug = 'GetBBSTopicListBySlug';

interface GetBBSTopicListBySlug {
    slug: string;
    total: number;
    pageSize: number;
    keyword: string;
}

// qiniu token
const getQiniuToken = 'GetQiniuToken';

interface QiniuToken {
    name: string;
}

// lock user
const LockUser = 'M_User';

interface LockUser {
    id: number;
    magic1: number;
    magic2: number;
}

// compentition list
const getCompetitionList = 'GetCompetitionList';

interface GetCompetitionList {
    startTime: string; // const YY-MM-01 00: 00: 00;
    endTime: string; // const YY-MM-DD 22: 00: 00;
}

// disable two factor
const disableTwofactor = 'DisableTwofactor';

interface DisableTwofactor {
    token: string;
}

// robot
const getPublicRobotList = 'GetPublicRobotList';

interface GetPublicRobotList {
    magic1: number;
    magic2: number;
    magic3: number;
}

const getPublicRobot = 'PublicRobot';

interface GetPublicRobot {
    id: number;
    type: string;
}

const stopRobot = 'StopRobot';

interface StopRobot {
    id: number;
}

const restartRobot = 'RestartRobot';

interface RestartRobot {
    id: number;
}

const deleteRobot = 'DeleteRobot';

interface DeleteRobot {
    id: number;
    checked: boolean;
}

const getRobotDetail = 'GetRobotDetail';

interface GetRobotDetail {
    id: number;
}

const modifyRobot = 'ModifyRobot';

interface ModifyRobot {
    id: number;
    name: number;
    nodeId: number;
    ktickId: number;
    pairExchanges: number[];
    pairStocks: string[];
    magic1: string[];
}

const getRobotLogs = 'GetRobotLogs';

interface GetRobotLogs {
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

const subscribeRobot = 'SubscribeRobot';

interface SubscribeRobot {
    id: number;
}

const CommandRobot = 'CommandRobot';

interface CommandRobot {
    id: number;
    command: string;
}

// login
const login = 'Login';

interface Login {
    username: string;
    password: string; // encoded password;
    magic1: string;
}

interface CommonDelete {
    id: number;
}

// notify
const deleteNotify = 'DeleteNotify';

interface DeleteNotify extends CommonDelete { }

const getBBSNotify = 'GetBBSNotify';

interface GetBBSNotify {
    magic1: number;
    magic2: number;
}

// message
const deleteMessage = 'DeleteMessage';

interface DeleteMessage extends CommonDelete { }

const deleteAPMMessage = 'DeleteAPMMessage';

interface DeleteAPMMessage extends CommonDelete { }

// push queue
const GetPushQueue = 'getPushQueue';

interface GetPushQueue {
    magic1: number;
    magic2: number;
}

// apm queue
const getAPMQueue = 'GetAPMQueue'

interface GetAPMQueue {
    magic1: number;
    magic2: number;
}

// google auth key
const getGoogleAuthKey = 'GetGoogleAuthKey';

interface GetGoogleAuthKey {

}

const getBindGoogleAuth = 'BindGoogleAuth';

interface GetBindGoogleAuth {
    code: string;
    key: string;
}

// shadow member
const getShadowMember = 'GetShadowMember';

interface GetShadowMember {

}

const addShadowMember = 'SaveShadowMember';

interface AddShadowMember {
    memberId: number;
    username: string;
    password: string;
    permissionList: number[];
}

const deleteShadowMember = 'DeleteShadowMember';

interface DeleteShadowMember {
    memberId: number;
}

const updateShadowMember = 'LockShadowMember';

interface UpdateShadowMember {
    memberId: number;
    status: number;
}

// account
const getAccount = 'GetAccount';

interface GetAccount {

}

// api key list
const getApiKeyList = 'GetApiKeyList';

interface GetApiKeyList {

}

// SNS
const getUnbindSNS = 'UnbindSNS'

interface GetUnbindSNS {

}

// change nick name
const getChangeNickName = 'ChangeNickName';

interface getChangeNickName {
    name: string;
}

// change pass word

const getChangePassword = 'ChangePassword';

interface getChangePassword {
    oldPassword: string;
    newPassword: string;
}

// api key

const addApiKey = 'CreateApiKey';

interface AddApiKey {
    magic1: string;
    magic2: string;
}

const updateApiKey = 'LockApiKey';

interface UpdateApiKey {
    id: number;
    status: number;
}

const deleteApiKey = 'DeleteApiKey';

interface DeleteApiKey extends CommonDelete { }

// node hash
const getNodeHash = 'GetNodeHash';

interface GetNodeHash {

}

// platform
const getPlatformDetail = 'GetPlatformDetail';

interface GetPlatformDetail {
    platoformId: number;
}

const getPlatformList = 'GetPlatformList';

interface GetPlatformList {

}

const updatePlatform = 'SavePlatform';

interface UpdatePlatform {
    platformId: number;
    exchangeId: number;
    dic: string; // json
    magic1: string;
    label: string;
}

const deletePlatform = 'DeletePlatform';

interface DeletePlatform {
    platformId: number;
}

// exchange list
const getExchangeList = 'GetExchangeList'

interface GetExchangeList {

}

// strategy list
const getStrategyList = 'GetStrategyList';

interface GetStrategyList {
    offset: number;
    limit: number;
    strategyType: number;
    category: number;
    args: number;
}

const getStrategyListByName = 'GetStrategyListByName';

interface GetStrategyListByName {
    count: number;
    pageSize: number;
    magic1: number;
    categoryId: number;
    magic2: number;
    keyword: string;
}

// node list
const getNodeList = 'GetNodeList';

interface GetNodeList {

}

const deleteNode = 'DeleteNode';

interface DeleteNode {
    nodeId: number;
}

// robot
const updateRobot = 'SaveRobot';

interface UpdateRobot {
    name: string;
    magic1: string;
    strategyId: number;
    ktickId: number;
    pairExchanges: number[];
    pairStocks: string[]; // string ? number?
    nodeId: number;
}

// backtest IO
const getBacktestIO = 'getBacktestIO';

interface GetBacktestIO {
    nodeId: number;
    typeId: number;
    dic: string // [] JSON.stringfiy array [ string, uuid ];
}

enum BacktestDescription {
    deleteTask = 'DelTask',
    getTaskStatus = 'GetTaskStatus',
    getTaskResult = 'GetTaskResult',
    putTask = 'PutTask',
    stopTask = 'StopTask'
}

// strategy token
const opStrategyToken = 'OpStrategyToken'

interface OpStrategyToken {
    id: number;
    code: number;
}

// get strategy detail
const getStrategyDetail = 'GetStrategyDetail'

interface GetStrategyDetail {
    strategyId: number;
}

const updateStrategy = 'SaveStrategy';

interface UpdateStrategy {
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

const shareStrategy = 'ShareStrategy';

interface ShareStrategy {
    strategyId: number;
    typeId: number;
}

const deleteStrategy = 'DeleteStrategy';

interface DeleteStrategy {
    strategyId: number;
}

const getPublicStrategyDetail = 'GetPublicStrategyDetail';

interface GetPublicStrategyDetail {
    strategyId: number;
}

// templates
const getTemplates = 'GetTemplates';

interface GetTemplates {
    ids: number[];
}

// broadcast
const setBroadcast = 'SetBroadcast';

interface SetBroadcast {
    id: number;
}

const getBroadcast = 'GetBroadcast';

interface GetBroadcast {
    count: number;
}

// watch dog
const setRobotWD = 'SetRobotWD';

interface SetRobotWD {
    id: number;
    watchDogStatus: number;
}

const setNodeWD = 'SetNodeWD';

interface SetNodeWD {
    id: number;
    watchDogStatus: number;
}

// verify key
const verifyKey = 'VerifyKey';

interface VerifyKey {
    id: number;
    scode: number;
}

// get key
const getGenKey = 'GetGenKey';

interface GetGenKey {
    magic1: number;
    id: number;
    days: number;
    maxConcurrent: number;
}

// payment
const getPaymentArg = 'GetPaymentArg';

interface GetPaymentArg {
    method: number;
    magic1: number;
    pricingAmount: number;
}

const getPayOrders = 'GetPayOrders';

interface GetPayOrders { }

// trade
const getTradeHistory = 'GetTradeHistory';

interface GetTradeHistory {
    magic1: number[];
}

const updateTradeHistory = 'SaveTradeHistory';

interface UpdateTradeHistory {
    id: number;
    expire: string;
    concurrent: number;
}

// sandbox
const getSandBoxToken = 'GetSandBoxToken';

interface GetSandBoxToken { }

// Stats
const getStats = 'GetStats';

interface GetStats {
    code: number;
}

// priority
const setClusterPriority = 'SetClusterPriority';

interface SetClusterPriority {
    magic1: number[];
}

// password
const resetPassword = 'ResetPassword';

interface ResetPassword {
    email: string;
}

const SetPassword = 'SetPassword';

interface SetPassword {
    token: string;
    password: string;
}

// reset two factor
const resetTwofactor = 'ResetTwofactor';

interface ResetTwofactor {
    username: string;
    password: string;
    emmail: string;
}

// csp report
const getCSPReport = 'CSPReport';

interface GetCSPReport {
    magic1: string[];
}

// signup
const signup = 'Signup';

interface Signup {
    username: string;
    email: string;
    password: string; // crypted password.
    refUser: string;
    refUrl: string;
}

// M_Public
const getM_Public = 'M_Public';

interface GetM_Public {
    id: number;
    magic1: number;
    magic2: number;
}

// comment
const submitComment = 'SubmitComment';

interface SubmitComment {
    topic: number;
    content: string;
    replyId: number;
    subReplyId: number;
    commentId: number;
}

const GetCommentList = 'GetCommentList';

interface GetCommentList {
    topic: number;
    magic1: string;
    magic2: string;
}

// verify password
const verifyPassword = 'VerifyPassword';

interface VerifyPassword {
    password: string;
}
