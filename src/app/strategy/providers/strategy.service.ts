import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { isNumber, sortBy } from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { BaseService } from '../../base/base.service';
import { TemplateVariableOverview, VariableOverview } from '../../interfaces/constant.interface';
import * as fromReq from '../../interfaces/request.interface';
import * as fromRes from '../../interfaces/response.interface';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import { GroupedList, UtilService } from '../../providers/util.service';
import * as fromRoot from '../../store/index.reducer';

export interface GroupedStrategy extends GroupedList<fromRes.Strategy> {
    groupNameValue?: any;
}

export interface SemanticArg {
    semanticArgs: VariableOverview[];
    semanticTemplateArgs: TemplateVariableOverview[];
}

@Injectable()
export class StrategyService extends BaseService {

    constructor(
        private store: Store<fromRoot.AppState>,
        private error: ErrorService,
        private process: ProcessService,
        private utilService: UtilService,
    ) { super() }

    /* =======================================================Serve Request======================================================= */

    launchStrategy(source: Observable<fromReq.GetStrategyListRequest>): Subscription {
        return this.process.processStrategyList(source);
    }

    /* =======================================================Date acquisition======================================================= */

    private getStrategyResponse(): Observable<fromRes.GetStrategyListResponse> {
        return this.store.select(fromRoot.selectStrategyListResponse)
            .filter(this.isTruth);
    }

    getStrategies(): Observable<fromRes.Strategy[]> {
        return this.getStrategyResponse().map(res => res.result.strategies);
    }

    getGroupedStrategy(key: string, getName?: (arg: number | boolean) => string, getNameValue?: (arg: string) => number | boolean): Observable<GroupedStrategy[]> {
        return this.utilService.getGroupedList(this.getStrategies(), key, getName)
            .map(list => {
                if (getNameValue) {
                    const result = list.map(({ groupName, values }) => ({ groupName, values, groupNameValue: getNameValue(groupName) }));

                    return sortBy(result, item => item.groupNameValue);
                } else {
                    return list;
                }
            });
    }

    getStrategyArgs(strategyId: Observable<number>): Observable<SemanticArg> {
        return this.getStrategies()
            .combineLatest(strategyId.filter(this.isTruth), (strategies, id) => {
                const { semanticArgs, semanticTemplateArgs } = strategies.find(item => item.id === id);

                const noArgs = !semanticArgs.length && !semanticTemplateArgs;

                return noArgs ? null : { semanticArgs, semanticTemplateArgs };
            });
    }

    /* =======================================================Shortcut methods======================================================= */

    getCategoryName(id: number): string {
        return fromReq.CategoryType[id] || 'UNKNOWN_TYPE';
    }

    reverseGetCategoryName(str: string): number {
        const id = fromReq.CategoryType[str];

        return isNumber(id) ? id : void 0;
    }

    /* =======================================================Error handler======================================================= */

    handleStrategyListError(): Subscription {
        return this.error.handleResponseError(this.getStrategyResponse());
    }

}
