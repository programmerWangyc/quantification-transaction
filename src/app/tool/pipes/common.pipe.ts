import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { isBoolean, isNumber, isObject, isString, zip } from 'lodash';
import * as moment from 'moment';

import { CategoryType } from '../../interfaces/request.interface';
import { Strategy, BtNode } from '../../interfaces/response.interface';
import { ConstantService, K_LINE_PERIOD } from '../../providers/constant.service';
import { pictureUrlReg } from '../../validators/validators';
import { Language } from '../../strategy/strategy.config';
import { TranslateService } from '@ngx-translate/core';

@Pipe({ name: 'bytes' })
export class BytesPipe implements PipeTransform {
    transform(input: number, precision: number = 2): string | number {
        if (isNaN(input) || !isFinite(input)) return '-';

        if (input <= 0) return input;

        const units = ['input', 'KB', 'MB', 'GB', 'TB', 'PB'];

        const number = Math.floor(Math.log(input) / Math.log(1024));

        return (input / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
    }
}

@Pipe({ name: 'fromJSON' })
export class FromJSONPipe implements PipeTransform {
    transform(source: string): any {
        return JSON.parse(source);
    }
}

@Pipe({
    name: 'originData',
})
export class OriginDataPipe implements PipeTransform {
    transform(source: any): string | number {
        if (isString(source) || isNumber(source)) return source;

        if (isBoolean(source)) return source.toString();

        if (isObject(source)) return JSON.stringify(source);
    }
}

@Pipe({
    name: 'safeHtml',
})
export class SafeHtmlPipe implements PipeTransform {
    constructor(private domSanitizer: DomSanitizer) { }

    /**
     * TODO: 仅用了框架的方法处理了输入，不确定能否达到安全要求；
     */
    transform(source: string): SafeHtml {
        return this.domSanitizer.bypassSecurityTrustHtml(source);
    }
}

@Pipe({ name: 'fromNow' })
export class FromNowPipe implements PipeTransform {
    transform(value: string): string {
        return moment(value).fromNow();
    }
}

@Pipe({ name: 'toMarkdown' })
export class ToMarkdownPipe implements PipeTransform {
    transform(value: string): string {
        let result = null;

        while (true) {
            result = pictureUrlReg.exec(value);

            if (!!result) {
                const [str] = result;

                value = value.replace(str, `![image](${str})`);
            } else {
                break;
            }
        }

        return value;
    }
}

@Pipe({ name: 'strategyName' })
export class StrategyNamePipe implements PipeTransform {
    transform(target: Strategy): string {
        const name = target.name;

        return target.category === CategoryType.TEMPLATE_SNAPSHOT ? name.substring(name.indexOf('-') + 1) : name;
    }
}

@Pipe({ name: 'variableType' })
export class VariableTypePipe implements PipeTransform {

    constructor(private constantService: ConstantService) { }

    transform(id: number): string {
        return this.constantService.getArgSelectedItem(id).inputType;
    }
}

@Pipe({ name: 'commandButtonText' })
export class CommandButtonTextPipe implements PipeTransform {
    constructor(private constantService: ConstantService) { }

    transform(value: string): string {
        return value.split(this.constantService.COMMAND_PREFIX)[1];
    }
}

@Pipe({ name: 'variableToSelectList' })
export class VariableToSelectListPipe implements PipeTransform {
    constructor(private constantService: ConstantService) { }

    transform(value: string): string[] {
        return this.constantService.transformStringToList(value);
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

@Pipe({ name: 'btNodeName' })
export class BtNodeNamePipe implements PipeTransform {
    transform(source: BtNode): string {
        const { region, ip, os, name, id } = source;

        if (source.public === 1 && !source.is_owner) {
            return `${region} : ${ip} - ${os}`;
        } else {
            return `${id} : ${ip} - ${os}${typeof name === 'string' ? name : ''}`;
        }
    }
}

@Pipe({ name: 'kLinePeriod' })
export class KLinePeriodPipe implements PipeTransform {
    transform(source: any[]): string {
        const [id] = source;

        const target = K_LINE_PERIOD.find(item => item.id === id);

        return target.period;
    }
}

@Pipe({ name: 'balance' })
export class BalancePipe implements PipeTransform {
    transform(data: number): string {
        return (data / 1e8).toFixed(3);
    }
}

export interface PlatformStockPair {
    platform: string;
    stock: string;
}
@Pipe({ name: 'platformStock' })
export class PlatformStockPipe implements PipeTransform {
    transform(source: any[][]): PlatformStockPair[] {
        const [, platforms, stocks] = source;

        return zip(platforms, stocks).map(ary => ({ platform: ary[0] === -1 ? 'BotVS' : ary[0], stock: ary[1] }));
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

@Pipe({ name: 'summaryInfo' })
export class SummaryInfoPipe implements PipeTransform {
    transform(value: string): any {
        if (isString(value)) {
            return `<img src="${value.substring(0, value.length - 1)}" style="max-width: 200px;">`;
        } else {
            return value;
        }
    }
}

@Pipe({ name: 'pluckContent' })
export class PluckContentPipe implements PipeTransform {
    transform(value: any): any {

        if (isObject(value)) {
            return value.name;
        } else {
            return value;
        }
    }
}

@Pipe({ name: 'strategyChartTitle' })
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
