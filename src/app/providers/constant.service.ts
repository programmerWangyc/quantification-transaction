import { Injectable } from '@angular/core';

import { LogTypes, RobotOperateMap, VariableType, VariableTypeDes } from '../interfaces/constant.interface';
import { ArgOptimizeSetting } from './../interfaces/constant.interface';


export const VERSION = 3.5;


export interface KLinePeriod {
    period: string;
    id: number;
    minutes: number;
}

export const K_LINE_PERIOD: KLinePeriod[] = [{
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

export const ROBOT_OPERATE_MAP: RobotOperateMap[] = [
    { btnText: ['RESTART', 'RESTARTING'], tip: 'RESTART_ROBOT_CONFIRM' },
    { btnText: ['STOP', 'STOPPING'], tip: 'STOP_ROBOT_CONFIRM' },
    { btnText: ['KILL'], tip: 'KILL_ROBOT_CONFIRM' },
];

export const VARIABLE_TYPES: VariableTypeDes[] = [{
    id: VariableType.NUMBER_TYPE,
    name: 'NUMBER_TYPE',
    inputType: 'number'
}, {
    id: VariableType.BOOLEAN_TYPE,
    name: 'BOOLEAN_TYPE',
    inputType: 'checkbox'
}, {
    id: VariableType.STRING_TYPE,
    name: 'STRING_TYPE',
    inputType: 'text'
}, {
    id: VariableType.SELECT_TYPE,
    name: 'SELECT_TYPE',
    inputType: 'selected'
}, {
    id: VariableType.ENCRYPT_STRING_TYPE,
    name: 'ENCRYPT_STRING_TYPE',
    inputType: 'password'
}, {
    id: VariableType.BUTTON_TYPE,
    name: 'BUTTON_TYPE',
    inputType: 'button'
}];

export const LIST_PREFIX = '$$$__list__$$$';

export const COMMAND_PREFIX = '$$$__cmd__$$$';

export const ENCRYPT_PREFIX = '$$$__enc__$$$';

export const VARIABLE_NAME_REGEXPS: RegExp[] = [
    /^([a-zA-Z_$][0-9a-zA-Z_$]*)@([a-zA-Z_$][0-9a-zA-Z_$]*)([=!><]=|>|<)([0-9]*)$/,
    /^([a-zA-Z_$][0-9a-zA-Z_$]*)@([!]*[a-zA-Z_$][0-9a-zA-Z_$]*)$/
];

export const COINS = {
    '-1': '',
    '0': 'HUOBI',
    '1': 'OKCoin',
    '2': 'BTCC',
    '3': 'YUNBI',
    '4': 'CHBTC',
    '5': 'BTCTRADE',
    '6': 'BTC100',
    '7': 'Binance',
    '8': '796_FUTURES',
    '9': 'HaoBTC',
    '10': 'BTER',
    '11': 'BITVC',
    '12': 'OKCOIN',
    '13': 'EXCHANGE',
    '14': 'ViaBTC',
    '15': 'Jubi',
    '16': 'BotVS',
    '17': 'BTC38',
    '20': 'BTC-E',
    '21': 'Bitstamp',
    '22': 'Bitfinex',
    '23': 'OKCOINEN',
    '24': 'Bithumb',
    '25': 'Korbit',
    '26': 'CoinPlus',
    '27': 'Poloniex',
    '28': 'Kraken',
    '30': 'ZTrade',
    '31': 'Quoine',
    '32': 'Coincheck',
    '33': 'Zaif',
    '34': 'BitMEX',
    '35': 'OKEX',
    '36': 'Bittrex',
    '100': 'CTP',
    '101': 'LTS'
};

export const PAGE_SIZE_SELECT_VALUES = [20, 50, 100, 500];

export function getArgSelectItem(id: number): VariableTypeDes {
    if (id > 5 || id < 0) {
        throw new RangeError('Range error: ID passed in is out of range;');
    }
    return VARIABLE_TYPES.find(item => item.id === id);
}

export function getArgCondition(value: string): any[] {
    const condition = VARIABLE_NAME_REGEXPS.map((reg, index) => {
        const result = value.match(reg);

        if (result && index === 0) return result.slice(2, 5);

        if (result && index === 1) return [result[2].replace(/!/g, ''), result[2][0] === '!' ? '!=' : '==', '1'];

        return null;
    }).find(item => !!item);

    return condition || [];
}

export function getOptimizeSetting(value: number): ArgOptimizeSetting {
    return value < 1 ? {
        begin: 0.1,
        end: 1.0,
        step: 0.1
    } : {
            begin: Math.max(1, Math.round(value * 0.5)),
            end: Math.max(2, Math.round(value * 1.5)),
            step: Math.max(1, Math.round(value * 0.1))
        };
}
export function transformStringToList(value: string): string[] {
    const target = value.split(LIST_PREFIX)[1];

    return target.split('|');
}

export function withoutPrefix(value: string, prefix: string): string {
    return value.split(prefix)[1];
}

@Injectable()
export class ConstantService {

    VERSION = VERSION;

    K_LINE_PERIOD = K_LINE_PERIOD;

    ROBOT_OPERATE_MAP = ROBOT_OPERATE_MAP;

    VARIABLE_TYPES = VARIABLE_TYPES;

    LIST_PREFIX = LIST_PREFIX;

    COMMAND_PREFIX = COMMAND_PREFIX;

    ENCRYPT_PREFIX = ENCRYPT_PREFIX;

    VARIABLE_NAME_REGEXPS = VARIABLE_NAME_REGEXPS;

    COINS = COINS;

    LOG_TYPES = LogTypes;

    PAGE_SIZE_SELECT_VALUES = PAGE_SIZE_SELECT_VALUES;

    constructor() { }

    getRobotOperateMap(status: number): RobotOperateMap {
        if (status > 2) {
            return ROBOT_OPERATE_MAP[0];
        } else if (status === 2) {
            return ROBOT_OPERATE_MAP[2];
        } else {
            return ROBOT_OPERATE_MAP[1];
        }
    }

    getArgSelectedItem = getArgSelectItem;

    getOptimizeSetting = getOptimizeSetting;

    transformStringToList = transformStringToList;

    withoutPrefix = withoutPrefix;
}
