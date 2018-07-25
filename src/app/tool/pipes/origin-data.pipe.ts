import { Pipe, PipeTransform } from '@angular/core';
import { isBoolean, isNumber, isObject, isString } from 'lodash';

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
