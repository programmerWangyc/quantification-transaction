import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { isBoolean, isNumber, isObject, isString } from 'lodash';
import * as moment from 'moment';

import { pictureUrlReg } from '../../validators/validators';

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
