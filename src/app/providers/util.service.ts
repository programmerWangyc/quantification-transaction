import { Injectable } from '@angular/core';
import { isArray } from 'lodash';

@Injectable()
export class UtilService {

    constructor() { }

    replaceLabelVariable(label: string, obj: { [key: string]: any }): string {
        const reg = /\{\{([\w\d]+)\}\}/;

        let result = null;

        while ((result = reg.exec(label)) !== null) {
            const [matchString, key] = result;

            label = label.replace(matchString, obj[key]);
        }

        return label;
    }

    toArray<T>(value: T): T[] {
        return isArray(value) ? value : [value];
    }
}
