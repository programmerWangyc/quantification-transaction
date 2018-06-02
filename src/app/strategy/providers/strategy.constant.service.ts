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

@Injectable()
export class StrategyConstantService extends ConstantService {

    STRATEGY_CATEGORIES = STRATEGY_CATEGORIES;

    SUPPORTED_LANGUAGE = SUPPORTED_LANGUAGE;

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
}
