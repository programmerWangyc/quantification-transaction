import { Pipe, PipeTransform } from '@angular/core';
import { zip } from 'lodash';

import { RobotPublicStatus, RobotStatus } from '../../interfaces/response.interface';
import { ConstantService } from './../../providers/constant.service';


@Pipe({
    name: 'robotStatus'
})
export class RobotStatusPipe implements PipeTransform {
    transform(status: number): string {
        return RobotStatus[status];
    }
}

@Pipe({
    name: 'robotPublicStatus'
})
export class RobotPublicStatusPipe implements PipeTransform {
    transform(status: number): string {
        return RobotPublicStatus[status];
    }
}

export interface PlatformStockPair {
    platform: string;
    stock: string;
}
@Pipe({
    name: 'platformStock'
})
export class PlatformStockPipe implements PipeTransform {
    transform(source: any[][]): PlatformStockPair[] {
        const [id, platforms, stocks] = source;

        return zip(platforms, stocks).map(ary => ({ platform: ary[0] === -1 ? 'BotVS' : ary[0], stock: ary[1] }));
    }
}

@Pipe({
    name: 'variableType'
})
export class VariableTypePipe implements PipeTransform {

    constructor(private constantService: ConstantService) { }

    transform(id: number): string {
        return this.constantService.getArgSelectedItem(id).inputType;
    }
}

@Pipe({
    name: 'variableToSelectList'
})
export class VariableToSelectListPipe implements PipeTransform {
    constructor(private constantService: ConstantService) { }

    transform(value: string): string[] {
        return this.constantService.transformStringToList(value);
    }
}

@Pipe({
    name: 'robotCommandButtonText'
})
export class RobotCommandButtonTextPipe implements PipeTransform {
    constructor(private constantService: ConstantService) { }

    transform(value: string): string {
        return value.split(this.constantService.COMMAND_PREFIX)[1];
    }
}