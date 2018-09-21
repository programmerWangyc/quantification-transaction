import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { isArray, isString } from 'lodash';
import * as moment from 'moment';
import { combineLatest, from as observableFrom, Observable, of } from 'rxjs';
import { distinctUntilChanged, groupBy, map, mergeMap, reduce, switchMap } from 'rxjs/operators';

import { BaseService } from '../base/base.service';
import { ChartSize, VariableOverview } from '../interfaces/app.interface';
import { RunningLog } from '../interfaces/response.interface';
import { pictureUrlReg } from '../validators/validators';

export interface GroupedList<T> {
    groupName: string;
    values: T[];
}

export function getRunningLogs(source: (string | number)[][], isBacktest = false): RunningLog[] {
    const getResult = (id, date, logType, eid, orderId, price, amount, extra, contractType, direction) => ({
        id: <number>id,
        logType: <number>logType,
        eid: <string>eid,
        orderId: <string>orderId,
        extra: <string>extra,
        contractType: <string>contractType,
        direction: <string>direction,
        price: parseFloat((<number>price).toFixed(12)),
        amount: parseFloat((<number>amount).toFixed(6)),
        date: moment(date).format('YYYY-MM-DD HH:mm:ss'),
    });

    return source.map(ary => {
        if (isBacktest) {
            const [id, date, logType, eid, orderId, price, amount, extra, contractType, direction] = ary;

            return getResult(id, date, logType, eid, orderId, price, amount, extra, contractType, direction);
        } else {
            const [id, logType, eid, orderId, price, amount, extra, date, contractType = '', direction = ''] = ary;

            return getResult(id, date, logType, eid, orderId, price, amount, extra, contractType, direction);
        }
    });
}

@Injectable()
export class UtilService extends BaseService {

    getRunningLogs = getRunningLogs;

    constructor(
        private translate: TranslateService,
    ) {
        super();
    }

    toArray<T>(value: T): T[] {
        return isArray(value) ? value : [value];
    }

    getGroupedList<T>(source: Observable<T[]>, distinctKey: string, getGroupName = arg => String(arg)): Observable<GroupedList<T>[]> {
        return source.pipe(
            mergeMap(list => observableFrom(list).pipe(
                groupBy(item => item[distinctKey]),
                mergeMap(obs => obs.pipe(
                    reduce((acc, cur) => [...acc, cur], [obs.key]),
                    map(ary => ({ groupName: isString(ary[0]) ? ary[0] : getGroupName(ary[0]), values: ary.slice(1) }))
                )
                ),
                reduce((acc, cur) => [...acc, cur], [])
            ))
        );
    }

    createChartSize(charts: Highcharts.ChartObject[] | Highcharts.ChartObject): ChartSize {
        const chart = document.getElementsByClassName('chart');

        const target = window.getComputedStyle(chart[0]);

        const width = parseInt(target.width, 10);

        const height = parseInt(target.height, 10);

        return { charts, width, height };
    }

    getPaginationStatistics(totalObs: Observable<number>, pageSizeObs: Observable<number>): Observable<string> {
        return combineLatest(
            totalObs,
            pageSizeObs
        ).pipe(
            map(([total, page]) => ({ total, page: Math.ceil(total / page) })),
            switchMap(({ total, page }) => this.translate.get('PAGINATION_STATISTICS', { total, page })),
            distinctUntilChanged()
        );
    }

    pluckPictures(source: string): string[] {
        let result = [];

        const urls = [];

        while (true) {
            result = pictureUrlReg.exec(source);

            if (!!result) {
                urls.push(result[0]);
            } else {
                break;
            }
        }

        return urls;
    }

    getGroupedStrategyArgs<T extends VariableOverview>(source: T[], getGroupName: (T) => string): Observable<GroupedList<T>[]> {
        const patchedSource: T[] = source.map(item => Object.assign(item, { groupName: getGroupName(item) }));

        return this.getGroupedList(of(patchedSource), 'groupName');
    }
}
