import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { isNumber, sortBy } from 'lodash';
import { NzModalService } from 'ng-zorro-antd';
import { Observable } from 'rxjs/Observable';
import { from } from 'rxjs/observable/from';
import { of } from 'rxjs/observable/of';
import { find, map, mergeMap, take } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';

import { BaseService } from '../../base/base.service';
import { TemplateVariableOverview, VariableOverview } from '../../interfaces/app.interface';
import * as fromReq from '../../interfaces/request.interface';
import * as fromRes from '../../interfaces/response.interface';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import { GroupedList, UtilService } from '../../providers/util.service';
import * as fromRoot from '../../store/index.reducer';
import { ResetStateAction, UpdateStrategySecretKeyStateAction } from '../../store/strategy/strategy.action';
import { RequestParams } from '../../store/strategy/strategy.reducer';
import { SimpleNzConfirmWrapComponent } from '../../tool/simple-nz-confirm-wrap/simple-nz-confirm-wrap.component';
import { OpStrategyTokenTypeAdapter } from '../strategy.config';
import { StrategyConstantService } from './strategy.constant.service';

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
        public store: Store<fromRoot.AppState>,
        public error: ErrorService,
        public process: ProcessService,
        public utilService: UtilService,
        public nzModal: NzModalService,
        public constant: StrategyConstantService,
    ) { super() }

    /* =======================================================Serve Request======================================================= */

    launchStrategyList(source: Observable<fromReq.GetStrategyListRequest>): Subscription {
        return this.process.processStrategyList(source);
    }

    launchOpStrategyToken(source: Observable<fromReq.OpStrategyTokenRequest>): Subscription {
        return this.process.processOpStrategyToken(source.switchMap(source => source.opCode === OpStrategyTokenTypeAdapter.GET ? of(source)
            : this.confirmLaunchOpStrategyToken(source)
                .map(_ => ({ strategyId: source.strategyId, opCode: this.constant.adaptedOpStrategyTokenType(source.opCode) })))
        );
    }

    /* =======================================================Date acquisition======================================================= */

    private getStrategyResponse(): Observable<fromRes.GetStrategyListResponse> {
        return this.store.select(fromRoot.selectStrategyListResponse)
            .filter(this.isTruth);
    }

    protected getRequestParams(): Observable<RequestParams> {
        return this.store.select(fromRoot.selectStrategyRequestParams)
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

    private getOpStrategyTokenResponse(): Observable<fromRes.OpStrategyTokenResponse> {
        return this.store.select(fromRoot.selectOpStrategyTokenResponse)
            .filter(this.isTruth);
    }

    /**
     * @description Get secret key response from 'OpStrategyToken' api.
     */
    getStrategyToken(): Observable<string> {
        return this.getOpStrategyTokenResponse().pipe(map(res => res.result));
    }

    updateStrategySecretKeyState(id: number): Subscription {
        return this.getOpStrategyTokenResponse().map(res => !!res.result)
            .subscribe(hasToken => this.store.dispatch(new UpdateStrategySecretKeyStateAction({ id, hasToken })));
    }

    /* =======================================================Local state change======================================================= */

    resetState(): void {
        this.store.dispatch(new ResetStateAction());
    }

    /* =======================================================Shortcut methods======================================================= */

    getCategoryName(id: number): string {
        return fromReq.CategoryType[id] || 'UNKNOWN_TYPE';
    }

    reverseGetCategoryName(str: string): number {
        const id = fromReq.CategoryType[str];

        return isNumber(id) ? id : void 0;
    }

    getSpecificStrategies(predicate: (data: fromRes.Strategy) => boolean): Observable<fromRes.Strategy[]> {
        return this.getStrategies().map(strategies => strategies.filter(predicate));
    }

    private confirmLaunchOpStrategyToken(source: fromReq.OpStrategyTokenRequest): Observable<boolean> {
        const modal = this.nzModal.confirm({
            nzContent: SimpleNzConfirmWrapComponent,
            nzComponentParams: { content: source.opCode === OpStrategyTokenTypeAdapter.ADD ? 'GEN_SECRET_KEY_CONFIRM' : 'UPDATE_SECRET_KEY_CONFIRM', },
            nzOnOk: () => modal.close(true)
        });

        return modal.afterClose.filter(this.isTruth);
    }

    hasToken(id: number): Observable<boolean> {
        return this.getStrategies().pipe(
            mergeMap(list => from(list)),
            find(strategy => strategy.id === id),
            map(strategy => strategy.hasToken),
            take(1)
        );
    }

    /* =======================================================Error handler======================================================= */

    handleStrategyListError(): Subscription {
        return this.error.handleResponseError(this.getStrategyResponse());
    }

    handleOpStrategyTokenError(): Subscription {
        return this.error.handleResponseError(this.getOpStrategyTokenResponse());
    }

}
