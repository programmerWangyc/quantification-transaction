import { Pipe, PipeTransform } from '@angular/core';
import { isObject, isString } from 'lodash';

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
