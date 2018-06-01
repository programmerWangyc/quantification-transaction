import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

import { CategoryType } from '../../interfaces/request.interface';
import { Strategy } from '../../interfaces/response.interface';
import { StrategyConstantService } from '../providers/strategy.constant.service';


@Pipe({
    name: 'strategyName'
})
export class StrategyNamePipe implements PipeTransform {
    transform(target: Strategy): string {
        let name = target.name;

        return target.category === CategoryType.TEMPLATE_SNAPSHOT ? name.substring(name.indexOf('-') + 1) : name;
    }
}

@Pipe({
    name: 'commandButtonText'
})
export class CommandButtonTextPipe implements PipeTransform {
    constructor(private constantService: StrategyConstantService) { }

    transform(value: string): string {
        return value.split(this.constantService.COMMAND_PREFIX)[1];
    }
}

@Pipe({
    name: 'removeMD5'
})
export class RemoveMd5Pipe implements PipeTransform {
    transform(name: string): string {
        const index = name.indexOf('-');

        if(index > 0) {
            return name.substring(index + 1);
        }else {
            return name;
        }
    }
}

@Pipe({
    name: 'variableType'
})
export class VariableTypePipe implements PipeTransform {

    constructor(private constantService: StrategyConstantService) { }

    transform(id: number): string {
        return this.constantService.getArgSelectedItem(id).inputType;
    }
}

@Pipe({
    name: 'variableToSelectList'
})
export class VariableToSelectListPipe implements PipeTransform {
    constructor(private constantService: StrategyConstantService) { }

    transform(value: string): string[] {
        return this.constantService.transformStringToList(value);
    }
}

@Pipe({
    name: 'latestModifyDes'
})
export class LatestModifyDesPipe implements PipeTransform {
    transform(value: string): string {
        return moment(value).fromNow();
    }
}

@Pipe({
    name: 'expireStatus'
})
export class ExpireStatusPipe implements PipeTransform {
    transform(value: string): string {
        return moment(value).diff(moment()) < 0 ? 'EXPIRED' : 'ALREADY_PURCHASE';
    }
}
