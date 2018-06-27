import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isString, last, zip } from 'lodash';
import { Observable } from 'rxjs/Observable';

import { Robot, RobotPublicStatus, RobotStatus } from '../../interfaces/response.interface';
import { RobotOperateType } from '../../store/robot/robot.reducer';
import { RobotConstantService } from '../providers/robot.constant.service';
import { RobotOperateService } from '../providers/robot.operate.service';
import { LogTypes } from '../robot.config';


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
    name: 'eid2String'
})
export class Eid2StringPipe implements PipeTransform {
    constructor(private constantService: RobotConstantService) { }

    transform(value: string): string {
        const coin = this.constantService.COINS[value];

        return isString(coin) ? coin : value;
    }
}

@Pipe({
    name: 'logType'
})
export class LogTypePipe implements PipeTransform {
    constructor() { }

    transform(value: number): string {
        return LogTypes[value];
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

@Pipe({
    name: 'strategyChartTitle'
})
export class StrategyChartTitlePipe implements PipeTransform {
    constructor(private translate: TranslateService) { }

    transform(source: Highcharts.Options, index: number): string {
        if (!!source.title && !!source.title.text) {
            return source.title.text;
        } else {
            let str = '';

            this.translate.get('STRATEGY_DEFAULT_TITLE', { index }).subscribe(label => str = label);

            return str;
        }
    }
}

@Pipe({
    name: 'robotOperateBtnText'
})
export class RobotOperateBtnTextPipe implements PipeTransform {
    constructor(
        private robotOperate: RobotOperateService,
        private constantService: RobotConstantService,
    ) { }

    transform(robot: Robot): Observable<string> {
        return this.robotOperate.isCurrentRobotOperating(
            robot,
            robot.status > 2 ? RobotOperateType.restart : RobotOperateType.stop
        ).map(loading => {
            const btnTexts = this.constantService.getRobotOperateMap(robot.status).btnText;

            return this.constantService.getRobotOperateBtnText(loading, btnTexts);
        });
    }
}
