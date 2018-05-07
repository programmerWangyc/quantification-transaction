import { Pipe, PipeTransform } from '@angular/core';
import { isString, last, zip } from 'lodash';

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

@Pipe({
    name: 'eid2String'
})
export class Eid2StringPipe implements PipeTransform {
    constructor(private constantService: ConstantService) { }

    transform(value: string): string {
        const coin = this.constantService.COINS[value];

        return isString(coin) ? coin : value;
    }
}

@Pipe({
    name: 'logType'
})
export class LogTypePipe implements PipeTransform {
    constructor(private constantService: ConstantService) { }

    transform(value: number): string {
        return this.constantService.LOG_TYPES[value];
    }
}

@Pipe({
    name: 'directionType'
})
export class DirectionTypePipe implements PipeTransform {
    transform(type: string): string {
        switch (type) {
            case "buy":
                return 'BUY_LONG';

            case "closebuy":
            case "closebuy_today":
                return 'SELL_CLOSE'

            case "sell":
                return 'SELL_SHORT';

            case "closesell":
            case "closesell_today":
                return 'BUY_COVER';

            default:
                return '';
        }
    }
}

@Pipe({
    name: 'logPrice'
})
export class LogPricePipe implements PipeTransform {
    constructor(private constantService: ConstantService) { }

    transform(price: number, logType: number): string | number {
        const types = [this.constantService.LOG_TYPES.BUY, this.constantService.LOG_TYPES.SALE, this.constantService.LOG_TYPES.PROFIT];

        if (types.indexOf(logType) !== -1) {
            return logType !== this.constantService.LOG_TYPES.PROFIT && price === -1 ? 'MARKET_ORDER' : price;
        } else {
            return '-';
        }
    }
}

@Pipe({
    name: 'extraContent'
})
export class ExtraContentPipe implements PipeTransform {
    colorInfoRegExp = /#[0-9A-Za-z]{6,12}$/gi;

    transform(source: string): string {
        if (last(source) === '@') {
            source = source.substring(0, source.length - 1).trim();
        }

        const regResult = source.match(this.colorInfoRegExp);

        if (regResult) {
            const [resStr] = regResult;

            source = source.slice(0, source.length - resStr.length).trim();
        }

        return source;
    }
}

@Pipe({
    name: 'showExtraIcon'
})
export class ShowExtraIconPipe implements PipeTransform {
    transform(source: string): boolean {
        return last(source) === '@';
    }
}

function getColorInfo(source: string): string {
    if (last(source) === '@') {
        source = source.substring(0, source.length - 1).trim();
    }

    const regResult = source.match(/#[0-9A-Za-z]{6,12}$/gi);

    if (regResult) {
        const [resStr] = regResult;

        return resStr;
    } else {
        return '';
    }
}

@Pipe({
    name: 'extraColorPicker'
})
export class ExtraColorPickerPipe implements PipeTransform {
    transform(source: string): string {
        const info = getColorInfo(source);

        return !!info ? info.slice(0, 7) : 'inherit';
    }
}

@Pipe({
    name: 'extraBcgColorPicker'
})
export class ExtraBcgColorPickerPipe implements PipeTransform {
    transform(source: string): string {
        const info = getColorInfo(source);

        return info.length > 7 ? `#${info.slice(7)}` : 'inherit'
    }
}