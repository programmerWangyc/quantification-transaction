import { Pipe, PipeTransform } from '@angular/core';

import * as moment from 'moment';

import { VariableType } from '../../app.config';
import { StrategyMetaArg } from '../add-arg/add-arg.component';
import { StrategyConstantService } from '../providers/strategy.constant.service';

@Pipe({ name: 'variableTypeName' })
export class VariableTypeNamePipe implements PipeTransform {

    constructor(private constantService: StrategyConstantService) { }

    transform(id: number): string {
        return this.constantService.getArgSelectedItem(id).name;
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
