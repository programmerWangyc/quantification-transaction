import { Injectable } from '@angular/core';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';

import { isArray, isString } from 'lodash';
import * as moment from 'moment';
import { combineLatest, from as observableFrom, Observable } from 'rxjs';
import { distinctUntilChanged, groupBy, map, mergeMap, reduce, switchMap } from 'rxjs/operators';

import { ChartSize } from '../interfaces/app.interface';
import { RunningLog } from '../interfaces/response.interface';
import { BaseService } from '../base/base.service';

export interface GroupedList<T> {
    groupName: string;
    values: T[];
}

/**
 * 获取运行日志，source里的元素将被转换成字典形式。
 * @param source Source data of log;
 * @param isBacktest Wether the source data produced by backtest or robot;
 * @returns 字典形式的运行日志；
 */
export function getRunningLogs(source: (string | number)[][], isBacktest = false): RunningLog[] {
    const getResult = (id, date, logType, eid, orderId, price, amount, extra, contractType, direction) => ({
        id: <number>id,
        logType: <number>logType,
        eid: <string>eid,
        orderId: <string>orderId,
        extra: <string>extra,
        contractType: <string>contractType, // !FIXME: contractType === direction ?
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

    /**
     * @ignore
     */
    getRunningLogs = getRunningLogs;

    constructor(
        private translate: TranslateService,
        private nzModal: NzModalService,
    ) {
        super();
    }

    /**
     * @ignore
     */
    toArray<T>(value: T): T[] {
        return isArray(value) ? value : [value];
    }

    /**
     * Save incoming data packets.
     * @param source - Origin data would be grouped.
     * @param distinctKey - The key used to distinct data.
     * @param getGroupName - Get grouped group name;
     * @returns Observable<GroupedList<T>[]> Grouped data.
     */
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

    /**
     * 获取图表对象及它的窗口尺寸以调整图表的大小。
     * @param charts highcharts object collection;
     */
    createChartSize(charts: Highcharts.ChartObject[] | Highcharts.ChartObject): ChartSize {
        const chart = document.getElementsByClassName('chart');

        const target = window.getComputedStyle(chart[0]);

        const width = parseInt(target.width, 10);

        const height = parseInt(target.height, 10);

        return { charts, width, height };
    }

    /**
     * Create the statistics label of log, depending on the log's total amount that from serve and the limit that from view.
     */
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

    /**
     * 执行操作之前的确认
     */
    guardRiskOperate(message: string, options: { [key: string]: any }): Observable<boolean> {
        return this.translate.get(message, options).pipe(
            mergeMap(content => {
                const modal: NzModalRef = this.nzModal.confirm({
                    nzContent: content,
                    nzOnOk: () => modal.close(true),
                });

                return modal.afterClose.pipe(
                    this.filterTruth()
                );
            })
        );
    }
}
