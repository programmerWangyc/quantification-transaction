import { Injectable } from '@angular/core';
import { isArray, isString } from 'lodash';
import * as moment from 'moment';
import { from as observableFrom, Observable } from 'rxjs';
import { groupBy, map, mergeMap, reduce } from 'rxjs/operators';

import { ChartSize } from '../interfaces/app.interface';
import { RunningLog } from './../interfaces/response.interface';


export interface GroupedList<T> {
    groupName: string;
    values: T[];
}

export function getRunningLogs(source: (string | number)[][]): RunningLog[] {
    return source.map(ary => {
        let [id, logType, eid, orderId, price, amount, extra, date, contractType = '', direction = ''] = ary;

        return {
            id: <number>id,
            logType: <number>logType,
            eid: <string>eid,
            orderId: <string>orderId,
            extra: <string>extra,
            contractType: <string>contractType, // FIXME: contractType === direction ?
            direction: <string>direction,
            price: parseFloat((<number>price).toFixed(12)),
            amount: parseFloat((<number>amount).toFixed(6)),
            date: moment(date).format('YYYY-MM-DD HH:mm:ss'),
        };
    });
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
     * Save incoming data packets.
     */
    getGroupedList<T>(source: Observable<T[]>, distinctKey: string, getGroupName = arg => String(arg)): Observable<GroupedList<T>[]> {
        return source
            .pipe(
                mergeMap(list => observableFrom(list)
                    .pipe(
                        groupBy(item => item[distinctKey]),
                        mergeMap(obs => obs
                            .pipe(
                                reduce((acc, cur) => [...acc, cur], [obs.key]),
                                map(ary => ({ groupName: isString(ary[0]) ? ary[0] : getGroupName(ary[0]), values: ary.slice(1) }))
                            )
                        ),
                        reduce((acc, cur) => [...acc, cur], [])
                    )
                )
            );
    }

    /**
     * 获取图表对象及它的窗口尺寸以调整图表的大小。
     * @param charts highcharts object collection;
     */
    createChartSize(charts: Highcharts.ChartObject[] | Highcharts.ChartObject): ChartSize {
        const chart = document.getElementsByClassName('chart');

        const target = window.getComputedStyle(chart[0]);

        const width = parseInt(target.width);

        const height = parseInt(target.height);

        return { charts, width, height };
    }

    /**
     * 获取运行日志，此方法会将长度为10的数组转换成字典形式。
     */
    getRunningLogs = getRunningLogs
}
