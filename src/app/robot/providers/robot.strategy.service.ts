import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { isNumber, sortBy } from 'lodash';
import { Observable, Subscription } from 'rxjs';
import { map, takeWhile, withLatestFrom } from 'rxjs/operators';

import { BaseService } from '../../base/base.service';
import { GroupedStrategy, keepAliveFn, SemanticArg } from '../../interfaces/app.interface';
import * as fromReq from '../../interfaces/request.interface';
import * as fromRes from '../../interfaces/response.interface';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import { UtilService } from '../../providers/util.service';
import * as fromRoot from '../../store/index.reducer';

@Injectable()
export class RobotStrategyService extends BaseService {

    constructor(
        private store: Store<fromRoot.AppState>,
        private error: ErrorService,
        private process: ProcessService,
        private utilService: UtilService,
    ) {
        super();
    }

    launchStrategyList(source: Observable<fromReq.GetStrategyListRequest>): Subscription {
        return this.process.processStrategyList(source);
    }

    private getStrategyListResponse(): Observable<fromRes.GetStrategyListResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectStrategyListResponse)
        );
    }

    private getStrategies(): Observable<fromRes.Strategy[]> {
        return this.getStrategyListResponse().pipe(
            map(res => res.result.strategies)
        );
    }

    getGroupedStrategy(key: string, getName?: (arg: number | boolean) => string, getNameValue?: (arg: string) => number | boolean): Observable<GroupedStrategy[]> {
        return this.utilService.getGroupedList(this.getStrategies(), key, getName).pipe(
            map(list => {
                if (getNameValue) {
                    const result = list.map(({ groupName, values }) => ({ groupName, values, groupNameValue: getNameValue(groupName) }));

                    return sortBy(result, item => item.groupNameValue);
                } else {
                    return list;
                }
            })
        );
    }

    getStrategyArgs(strategyId: Observable<number>): Observable<SemanticArg> {
        return strategyId.pipe(
            this.filterTruth(),
            withLatestFrom(this.getStrategies())
        ).pipe(
            map(([id, strategies]) => {
                const { semanticArgs, semanticTemplateArgs } = strategies.find(item => item.id === id);

                const noArgs = !semanticArgs.length && !semanticTemplateArgs;

                return noArgs ? null : { semanticArgs, semanticTemplateArgs };
            })
        );
    }

    getCategoryName(id: number): string {
        return fromReq.CategoryType[id] || 'UNKNOWN_TYPE';
    }

    reverseGetCategoryName(str: string): number {
        const id = fromReq.CategoryType[str];

        return isNumber(id) ? id : void 0;
    }

    handleStrategyListError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getStrategyListResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
}
