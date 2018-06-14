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

    toArray<T>(value: T): T[] {
        return isArray(value) ? value : [value];
    }

    /**
     * @param source - Origin data would be grouped.
     * @param distinctKey - The key used to distinct data.
     * @param getGroupName - Get grouped group name;
     * @returns Observable<GroupedList<T>[]> Grouped data.
     * @description Save incoming data packets.
     */
    getGroupedList<T>(source: Observable<T[]>, distinctKey: string, getGroupName = arg => String(arg)): Observable<GroupedList<T>[]> {
        return source.mergeMap(list => Observable.from(list).groupBy(item => item[distinctKey])
            .mergeMap(obs => obs.reduce((acc, cur) => [...acc, cur], [obs.key]))
            .map(ary => ({ groupName: isString(ary[0]) ? ary[0] : getGroupName(ary[0]), values: ary.slice(1) }))
            .reduce((acc, cur) => [...acc, cur], [])
        );
    }
}
