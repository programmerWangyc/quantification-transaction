// topic
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
const getAPMQueue = 'GetAPMQueue';

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
const getUnbindSNS = 'UnbindSNS';

interface GetUnbindSNS {

}

// change nick name
const getChangeNickName = 'ChangeNickName';

interface ChangeNickName {
    name: string;
}

// change pass word

const getChangePassword = 'ChangePassword';

interface ChangePassword {
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

// broadcast
const setBroadcast = 'SetBroadcast';

interface SetBroadcast {
    id: number;
}

const getBroadcast = 'GetBroadcast';

interface GetBroadcast {
    count: number;
}

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


// M_Public
const getM_Public = 'M_Public';

interface GetMPublic {
    id: number;
    magic1: number;
    magic2: number;
}
