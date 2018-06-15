import { Injectable } from '@angular/core';

import { VariableTypeDes } from '../../interfaces/app.interface';
import { CategoryType } from '../../interfaces/request.interface';
import { ConstantService } from '../../providers/constant.service';
import { Language, OpStrategyTokenTypeAdapter } from '../strategy.config';

export interface Category {
    name: string;
    id: number
}

export interface SupportedLanguage {
    name: string;
    id: number;
    icon: string;
}

const STRATEGY_CATEGORIES: Category[] = [
    { name: CategoryType[0], id: CategoryType.GENERAL_STRATEGY },
    { name: CategoryType[1], id: CategoryType.COMMODITY_FUTURES },
    { name: CategoryType[2], id: CategoryType.STOCK_SECURITY },
    { name: CategoryType[9], id: CategoryType.DIGITAL_CURRENCY },
    { name: CategoryType[20], id: CategoryType.TEMPLATE_LIBRARY },
    { name: CategoryType[30], id: CategoryType.TEMPLATE_SNAPSHOT },
];

const SUPPORTED_LANGUAGE: SupportedLanguage[] = [
    { name: Language[0], id: Language.JavaScript, icon: 'anticon-facebook' },
    { name: Language[1], id: Language.Python, icon: 'anticon-codepen' },
    { name: Language[2], id: Language['C++'], icon: 'anticon-amazon' }
];

const EDITOR_THEMES: string[] = [
    '3024-day',
    '3024-night',
    'abcdef',
    'ambiance',
    'ambiance-mobile',
    'base16-dark',
    'base16-light',
    'bespin',
    'blackboard',
    'cobalt',
    'colorforth',
    'darcula',
    'dracula',
    'duotone-dark',
    'duotone-light',
    'eclipse',
    'elegant',
    'erlang-dark',
    'gruvbox-dark',
    'hopscotch',
    'icecoder',
    'idea',
    'isotope',
    'lesser-dark',
    'liquibyte',
    'lucario',
    'material',
    'mbo',
    'mdn-like',
    'midnight',
    'monokai',
    'neat',
    'neo',
    'night',
    'oceanic-next',
    'panda-syntax',
    'paraiso-dark',
    'paraiso-light',
    'pastel-on-dark',
    'railscasts',
    'rubyblue',
    'seti',
    'shadowfox',
    'solarized',
    'ssms',
    'the-matrix',
    'tomorrow-night-bright',
    'tomorrow-night-eighties',
    'ttcn',
    'twilight',
    'vibrant-ink',
    'xq-dark',
    'xq-light',
    'yeti',
    'zenburn',
];

export interface LanguageInitialValue {
    codeValue: string;
    templateValue: string;
    mode: string;
    extensionName: string;
}

export const LANGUAGE_INITIAL_VALUE = new Map([
    [Language.JavaScript, { codeValue: 'function main() {\n    Log(exchange.GetAccount());\n}', templateValue: '/*\n -- 策略引用该模板以后直接用 $.Test() 调用此方法\n-- main 函数在策略中不会触发, 只做为模板调试的入口 \n*/\n$.Test = function() {\n    Log("Test");\n};\n\nfunction main() {\n    $.Test();\n}', mode: 'javascript', extensionName: '.js' }],
    [Language.Python, { codeValue: 'def main():\n    Log(exchange.GetAccount())\n', templateValue: 'def Test():\n    Log("template call")\n\next.Test = Test # 导出Test函数, 主策略可以通过ext.Test()调用', mode: 'python', extensionName: '.' }],
    [Language["C++"], { codeValue: 'void main() {\n    Log(exchange.GetAccount());\n}', templateValue: '// 策略引用该模板以后直接用 ext::Test() 调用此方法\nvoid Test() {\n    Log("template call");\n}', mode: 'text/x-c++src', extensionName: '.cpp' }]
]);

export const BUTTON_TYPE_VARIABLE_DEFAULT_VALUE = '__button__';

@Injectable()
export class StrategyConstantService extends ConstantService {

    STRATEGY_CATEGORIES = STRATEGY_CATEGORIES;

    SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;

    EDITOR_THEMES = EDITOR_THEMES;

    LANGUAGE_INITIAL_VALUE = LANGUAGE_INITIAL_VALUE;

    BUTTON_TYPE_VARIABLE_DEFAULT_VALUE = BUTTON_TYPE_VARIABLE_DEFAULT_VALUE;

    jsCommentReg = /\/\*backtest\n((.+\n)*)\*\//;

    pyCommentReg = /\'\'\'\*backtest\n((.+\n)*)\'\'\'/;

    constructor() {
        super();
    }

    getArgSelectedItem(id: number): VariableTypeDes {
        if (id > 5 || id < 0) {
            throw new RangeError('Range error: ID passed in is out of range;');
        }
        return this.VARIABLE_TYPES.find(item => item.id === id);
    }

    adaptedOpStrategyTokenType(type: number): number {
        if (type === OpStrategyTokenTypeAdapter.ADD) {
            return OpStrategyTokenTypeAdapter.UPDATE;
        } else {
            return type;
        };
    }

    isInitialValue(content: string): boolean {
        const values = this.LANGUAGE_INITIAL_VALUE.values();

        let result = false;

        while (true) {
            const item = values.next();

            if (item.done) {
                break;
            }

            if (item.value.codeValue === content || item.value.templateValue === content) {
                result = true;
                break
            }
        }

        return result;
    }
}
