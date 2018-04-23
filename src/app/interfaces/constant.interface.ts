export enum LocalStorageKey {
    username = 'username',
    token = 'missionId',
    refUrl = 'refUrl',
    refUser = 'refUser'
}

export const version = 3.5;

export enum Path {
    home = 'home',
    square = 'square',
    fact = 'fact',
    community = 'community',
    doc = 'doc',
    market = 'market',
    analyze = 'analyze',
    robot = 'robot',
    strategy = 'strategy',
    trustee = 'trustee',
    exchange = 'exchange',
    simulate = 'simulate',
    dashboard = 'dashboard',
}

export interface KLinePeriod {
    period: string;
    id: number;
    minutes: number;
}

export const kLinePeriod: KLinePeriod[] = [{
    period: 'ONE_MINUTE',
    id: 0,
    minutes: 1
}, {
    period: 'THREE_MINUTES',
    id: 1,
    minutes: 3
}, {
    period: 'FIVE_MINUTES',
    id: 2,
    minutes: 5
}, {
    period: 'FIFTEEN_MINUTES',
    id: 3,
    minutes: 15,
}, {
    period: 'THIRTY_MINUTES',
    id: 4,
    minutes: 30
}, {
    period: 'ONE_HOUR',
    id: 5,
    minutes: 60
}, {
    period: 'ONE_DAY',
    id: 10,
    minutes: 60 * 24
}]

export interface RobotOperateMap {
    tip: string;
    btnText: string[];
}
export const robotOperateMap: RobotOperateMap[] = [
    { btnText: ['RESTART', 'RESTARTING'], tip: 'RESTART_ROBOT_CONFIRM' },
    { btnText: ['STOP', 'STOPPING'], tip: 'STOP_ROBOT_CONFIRM' },
    { btnText: ['kill'], tip: 'KILL_ROBOT_CONFIRM' },
]

export function getRobotOperateMap(status: number): RobotOperateMap {
    if (status > 2) {
        return robotOperateMap[0];
    } else if (status === 2) {
        return robotOperateMap[2];
    } else {
        return robotOperateMap[1];
    }
}