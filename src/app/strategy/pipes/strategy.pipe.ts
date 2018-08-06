import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

import { VariableType } from '../../app.config';
import { CategoryType } from '../../interfaces/request.interface';
import { Strategy } from '../../interfaces/response.interface';
import { StrategyMetaArg } from '../add-arg/add-arg.component';
import { StrategyConstantService } from '../providers/strategy.constant.service';
import { Language } from '../strategy.config';


@Pipe({ name: 'strategyName' })
export class StrategyNamePipe implements PipeTransform {
    transform(target: Strategy): string {
        const name = target.name;

        return target.category === CategoryType.TEMPLATE_SNAPSHOT ? name.substring(name.indexOf('-') + 1) : name;
    }
}

@Pipe({ name: 'commandButtonText' })
export class CommandButtonTextPipe implements PipeTransform {
    constructor(private constantService: StrategyConstantService) { }

    transform(value: string): string {
        return value.split(this.constantService.COMMAND_PREFIX)[1];
    }
}

@Pipe({ name: 'removeMD5' })
export class RemoveMd5Pipe implements PipeTransform {
    transform(name: string): string {
        const index = name.indexOf('-');

        if (index > 0) {
            return name.substring(index + 1);
        } else {
            return name;
        }
    }
}

@Pipe({ name: 'templateName' })
export class TemplateNamePipe implements PipeTransform {
    transform(name: string): string {
        const index = name.indexOf('|');

        return index > 0 ? name.substring(0, index) : name;
    }
}

@Pipe({ name: 'variableType' })
export class VariableTypePipe implements PipeTransform {

    constructor(private constantService: StrategyConstantService) { }

    transform(id: number): string {
        return this.constantService.getArgSelectedItem(id).inputType;
    }
}

@Pipe({ name: 'variableTypeName' })
export class VariableTypeNamePipe implements PipeTransform {

    constructor(private constantService: StrategyConstantService) { }

    transform(id: number): string {
        return this.constantService.getArgSelectedItem(id).name;
    }
}

@Pipe({ name: 'variableToSelectList' })
export class VariableToSelectListPipe implements PipeTransform {
    constructor(private constantService: StrategyConstantService) { }

    transform(value: string): string[] {
        return this.constantService.transformStringToList(value);
    }
}

@Pipe({ name: 'expireStatus' })
export class ExpireStatusPipe implements PipeTransform {
    transform(value: string): string {
        return moment(value).diff(moment()) < 0 ? 'EXPIRED' : 'ALREADY_PURCHASE';
    }
}

@Pipe({ name: 'variableValue' })
export class VariableValuePipe implements PipeTransform {
    transform(input: StrategyMetaArg): any {
        if (input.type === VariableType.BOOLEAN_TYPE) {
            return input.type ? 'true' : 'false';
        } else if (input.type === VariableType.ENCRYPT_STRING_TYPE) {
            return (<string>input.defaultValue).replace(/./g, '*');
        } else {
            return input.defaultValue;
        }
    }
}

@Pipe({ name: 'categoryName' })
export class CategoryNamePipe implements PipeTransform {
    transform(input: number): string {
        return CategoryType[input];
    }
}

@Pipe({ name: 'programLanguage' })
export class ProgramLanguagePipe implements PipeTransform {
    transform(input: number): string {
        return Language[input];
    }
}

@Pipe({ name: 'categoryColor' })
export class CategoryColorPipe implements PipeTransform {
    transform(input: number): string {
        switch (input) {
            case CategoryType.DIGITAL_CURRENCY:
                return 'green';

            case CategoryType.COMMODITY_FUTURES:
                return 'gold';

            case CategoryType.STOCK_SECURITY:
                return 'purple';

            case CategoryType.TEMPLATE_LIBRARY:
                return 'cyan';

            default:
                return 'blue';
        }
    }
}
