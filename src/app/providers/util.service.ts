import { Injectable } from '@angular/core';
import { isArray, isString } from 'lodash';
import { Observable } from 'rxjs/Observable';

export interface GroupedList<T> {
    groupName: string;
    values: T[];
}
@Injectable()
export class UtilService {

    constructor() { }

    /**
     * @deprecated Use translateService.get method instead.
     */
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

    getGroupedList<T>(source: Observable<T[]>, distinctKey: string, getGroupName = arg => String(arg)): Observable<GroupedList<T>[]> {
        return source.mergeMap(list => Observable.from(list).groupBy(item => item[distinctKey])
            .mergeMap(obs => obs.reduce((acc, cur) => [...acc, cur], [obs.key]))
            .map(ary => ({ groupName: isString(ary[0]) ? ary[0] : getGroupName(ary[0]), values: ary.slice(1) }))
            .reduce((acc, cur) => [...acc, cur], [])
        );
    }
}
