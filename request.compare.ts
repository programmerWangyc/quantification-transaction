// topic
// const deleteBBSTopic = 'M_Topic';

// interface DeleteTopic {
//     topicId: number;
//     magic1: number;
//     magic2: number;
// }

// lock user
// const LockUser = 'M_User';

// interface LockUser {
//     id: number;
//     magic1: number;
//     magic2: number;
// }

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
    email: string;
}

// csp report
const getCSPReport = 'CSPReport';

interface GetCSPReport {
    blockedUrl: string;
    documentUrl: string;
}


// M_Public
// const getM_Public = 'M_Public';

// interface GetMPublic {
//     id: number;
//     magic1: number;
//     magic2: number;
// }
