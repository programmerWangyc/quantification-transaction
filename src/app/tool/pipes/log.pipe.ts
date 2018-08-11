import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { isString, last } from 'lodash';

import { ConstantService } from '../../providers/constant.service';
import { LogTypes } from '../tool.config';

@Pipe({ name: 'eid2String' })
export class Eid2StringPipe implements PipeTransform {
    constructor(private constantService: ConstantService) { }

    transform(value: string): string {
        const coin = this.constantService.COINS[value];

        return isString(coin) ? coin : value;
    }
}

@Pipe({ name: 'logType' })
export class LogTypePipe implements PipeTransform {
    constructor() { }

    transform(value: number): string {
        return LogTypes[value];
    }
}

@Pipe({ name: 'directionType' })
export class DirectionTypePipe implements PipeTransform {
    transform(type: string): string {
        switch (type) {
            case 'buy':
                return 'BUY_LONG';

            case 'closebuy':
            case 'closebuy_today':
                return 'SELL_CLOSE';

            case 'sell':
                return 'SELL_SHORT';

            case 'closesell':
            case 'closesell_today':
                return 'BUY_COVER';

            default:
                return '';
        }
    }
}

@Pipe({
    name: 'logPrice',
})
export class LogPricePipe implements PipeTransform {
    constructor(
        private translate: TranslateService,
    ) { }

    transform(price: number, logType: number): string | number {
        const types = [LogTypes.BUY, LogTypes.SALE, LogTypes.PROFIT];

        if (types.includes(logType)) {

            if (logType !== LogTypes.PROFIT && price === -1) {

                let result = null;

                this.translate.get('MARKET_ORDER').subscribe(label => result = label);

                return result;
            } else {
                return price;
            }
        } else {
            return '-';
        }
    }
}

@Pipe({
    name: 'extraContent',
})
export class ExtraContentPipe implements PipeTransform {
    colorInfoRegExp = /#[0-9A-Za-z]{6,12}$/gi;

    transform(source: string): string {
        if (!isString(source)) return source;

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
    name: 'showExtraIcon',
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
    name: 'extraColorPicker',
})
export class ExtraColorPickerPipe implements PipeTransform {
    transform(source: string): string {
        if (!isString(source)) return source;

        const info = getColorInfo(source);

        return !!info ? info.slice(0, 7) : 'inherit';
    }
}

@Pipe({
    name: 'extraBcgColorPicker',
})
export class ExtraBcgColorPickerPipe implements PipeTransform {
    transform(source: string): string {
        const info = getColorInfo(source);

        return info.length > 7 ? `#${info.slice(7)}` : 'inherit';
    }
}
