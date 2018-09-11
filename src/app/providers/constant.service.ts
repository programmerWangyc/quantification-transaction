import { Injectable } from '@angular/core';

import { VariableType } from '../app.config';
import { VariableTypeDes } from '../interfaces/app.interface';
import { booleanableVariableNameFormat, comparableVariableNameFormat } from '../validators/validators';

export const VERSION = 3.5;

export interface KLinePeriod {
    period: string;
    id: number;
    minutes: number;
}

export const K_LINE_PERIOD: KLinePeriod[] = [{
    period: 'ONE_MINUTE',
    id: 0,
    minutes: 1,
}, {
    period: 'THREE_MINUTES',
    id: 1,
    minutes: 3,
}, {
    period: 'FIVE_MINUTES',
    id: 2,
    minutes: 5,
}, {
    period: 'FIFTEEN_MINUTES',
    id: 3,
    minutes: 15,
}, {
    period: 'THIRTY_MINUTES',
    id: 4,
    minutes: 30,
}, {
    period: 'ONE_HOUR',
    id: 5,
    minutes: 60,
}, {
    period: 'ONE_DAY',
    id: 10,
    minutes: 60 * 24,
}];

export const VARIABLE_TYPES: VariableTypeDes[] = [{
    id: VariableType.NUMBER_TYPE,
    name: 'NUMBER_TYPE',
    inputType: 'number', // number
}, {
    id: VariableType.BOOLEAN_TYPE,
    name: 'BOOLEAN_TYPE',
    inputType: 'checkbox', // boolean
}, {
    id: VariableType.STRING_TYPE,
    name: 'STRING_TYPE',
    inputType: 'text', // string
}, {
    id: VariableType.SELECT_TYPE,
    name: 'SELECT_TYPE',
    inputType: 'selected', // string split with '|'
}, {
    id: VariableType.ENCRYPT_STRING_TYPE,
    name: 'ENCRYPT_STRING_TYPE',
    inputType: 'password', // string
}, {
    id: VariableType.BUTTON_TYPE,
    name: 'BUTTON_TYPE',
    inputType: 'button', // constant __button__
}];

export const LIST_PREFIX = '$$$__list__$$$';

export const COMMAND_PREFIX = '$$$__cmd__$$$';

export const ENCRYPT_PREFIX = '$$$__enc__$$$';

export const ENCRYPT_PREFIX2 = '$$$__';

export const VARIABLE_NAME_REGEXPS: RegExp[] = [comparableVariableNameFormat, booleanableVariableNameFormat];

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
    '101': 'LTS',
};

export const PAGE_SIZE_SELECT_VALUES = [20, 50, 100, 500];

export const removeConditionInName = (name: string): string => name.split('@')[0];

export const VALUE_OF_BUTTON_TYPE_ARG = '__button__';

export const FUTURES_CTP = 'Futures_CTP';

export const FUTURES_ESUNNY = 'Futures_Esunny';

export const COMMON_PROTOCOL_EXCHANGE = 'Exchange';

@Injectable()
export class ConstantService {

    readonly VERSION = VERSION;

    readonly K_LINE_PERIOD = K_LINE_PERIOD;

    readonly VARIABLE_TYPES = VARIABLE_TYPES;

    readonly LIST_PREFIX = LIST_PREFIX;

    readonly COMMAND_PREFIX = COMMAND_PREFIX;

    readonly ENCRYPT_PREFIX = ENCRYPT_PREFIX;

    readonly ENCRYPT_PREFIX2 = ENCRYPT_PREFIX2;

    readonly VARIABLE_NAME_REGEXPS = VARIABLE_NAME_REGEXPS;

    readonly COINS = COINS;

    readonly PAGE_SIZE_SELECT_VALUES = PAGE_SIZE_SELECT_VALUES;

    readonly VALUE_OF_BUTTON_TYPE_ARG = VALUE_OF_BUTTON_TYPE_ARG;

    readonly FUTURES_CTP = FUTURES_CTP;

    readonly FUTURES_ESUNNY = FUTURES_ESUNNY;

    readonly COMMON_PROTOCOL_EXCHANGE = COMMON_PROTOCOL_EXCHANGE;

    /**
     * 去掉参数名称中的条件；
     */
    removeConditionInName = removeConditionInName;

    constructor() { }

    /**
     * 将列表参数转换成 list 供组件使用；
     * @param value 列表值；
     */
    transformStringToList(value: string): string[] {
        let target = value;

        if (value.indexOf(this.LIST_PREFIX) === 0) {
            target = value.split(this.LIST_PREFIX)[1];
        }

        return target.split('|');
    }

    /**
     * 去掉参数名称前的标识符
     */
    withoutPrefix(value: string, prefix: string): string {
        return value.split(prefix)[1];
    }

    /**
     * 判定参数的生成函数；
     * @param argPrefix 判定的参数前缀；
     * @returns 返回的函数： 入参： 变量名称，返回：boolean；
     * 传入的变量是否属于带有特定前缀的参数；
     */
    isSpecialTypeArg = (argPrefix: string): (a: string) => boolean => {
        return (variableName: string) => variableName.indexOf(argPrefix) === 0;
    }

    /**
     * 传入的参数是否代表按钮
     */
    isButton = (value: any): boolean => {
        return value === this.VALUE_OF_BUTTON_TYPE_ARG;
    }

    getArgSelectedItem(id: number): VariableTypeDes {
        if (id > 5 || id < 0) {
            throw new RangeError('Range error: ID passed in is out of range;');
        }
        return this.VARIABLE_TYPES.find(item => item.id === id);
    }
}
