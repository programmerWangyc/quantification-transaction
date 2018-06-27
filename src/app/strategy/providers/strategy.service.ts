import * as moment from 'moment';
import { Injectable } from '@angular/core';
import {
    ActivatedRoute,
    ActivatedRouteSnapshot,
    CanActivate,
    CanActivateChild,
    Router,
    RouterStateSnapshot,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { isNumber, sortBy, intersectionWith, uniqBy } from 'lodash';
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
import { ResetStateAction, UpdateStrategySecretKeyStateAction, UpdateStrategyDependanceTemplatesAction, UpdateStrategyLanguageAction } from '../../store/strategy/strategy.action';
import { RequestParams } from '../../store/strategy/strategy.reducer';
import { SimpleNzConfirmWrapComponent } from '../../tool/simple-nz-confirm-wrap/simple-nz-confirm-wrap.component';
import { OpStrategyTokenTypeAdapter } from '../strategy.config';
import { StrategyConstantService } from './strategy.constant.service';
import { AppState } from '../../store/index.reducer';
import { TemplateRefItem } from '../strategy-dependance/strategy-dependance.component';
import { CategoryType } from '../../interfaces/request.interface';
import { BacktestTimeConfig, BacktestSelectedPair } from '../../backtest/backtest.interface';
import { TranslateService } from '@ngx-translate/core';

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
        public translate: TranslateService,
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

    launchStrategyDetail(source: Observable<fromReq.GetStrategyDetailRequest>): Subscription {
        return this.process.processStrategyDetail(source);
    }

    /* =======================================================Date acquisition======================================================= */

    private getStrategyListResponse(): Observable<fromRes.GetStrategyListResponse> {
        return this.store.select(fromRoot.selectStrategyListResponse)
            .filter(this.isTruth);
    }

    protected getRequestParams(): Observable<RequestParams> {
        return this.store.select(fromRoot.selectStrategyRequestParams)
            .filter(this.isTruth);
    }

    getStrategies(): Observable<fromRes.Strategy[]> {
        return this.getStrategyListResponse().map(res => res.result.strategies);
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

    private getStrategyDetailResponse(): Observable<fromRes.GetStrategyDetailResponse> {
        return this.store.select(fromRoot.selectStrategyDetailResponse).filter(this.isTruth);
    }

    getStrategyDetail(): Observable<fromRes.StrategyDetail> {
        return this.getStrategyDetailResponse().map(res => res.result.strategy);
    }

    getStrategyDependance(): Observable<TemplateRefItem[]> {
        return this.getAvailableDependance()
            .combineLatest(this.getCurrentDependance(), (available, current) => {
                const intersection = intersectionWith(available, current, (a, c) => a.id === c.id).map(item => item.id);

                const result = uniqBy(available.concat(current), 'id');

                return result.map(item => intersection.includes(item.id) ? { ...item, checked: true } : item);
            })
    }

    getAvailableDependance(): Observable<TemplateRefItem[]> {
        return this.getStrategies()
            .withLatestFrom(
                this.getStrategyDetail().map(item => item.id),
                (strategies, id) => strategies.map(({ name, id, category, language }) => ({ name, id, checked: false, isSnapshot: category === CategoryType.TEMPLATE_SNAPSHOT, language })).filter(item => item.id !== id)
            );
    }

    getCurrentDependance(): Observable<TemplateRefItem[]> {
        return this.getStrategyDetail()
            .map(detail => detail.templates ? detail.templates.map(tpl => {
                let { name, id, category, language } = tpl;

                if (category == CategoryType.TEMPLATE_SNAPSHOT) {
                    return { name: name.split('-')[1], id, checked: true, isSnapshot: true, language };
                } else {
                    return { name, id, checked: true, isSnapshot: false, language };
                }
            }) : []);
    }

    isLoading(): Observable<boolean> {
        return this.store.select(fromRoot.selectStrategyUIState).map(state => state.loading);
    }

    getExistedStrategyArgs(predicate: (s: string) => boolean): Observable<VariableOverview[]> {
        return this.getStrategyDetail()
            .map(detail => detail.semanticArgs.filter(arg => predicate(arg.variableName)))
    }

    getBacktestConfig(): Observable<string> {
        return this.store.select(fromRoot.selectBacktestUIState)
            .map(state => {
                const { timeOptions, platformOptions } = state;

                let { start, end, klinePeriodId } = timeOptions;

                const begin = moment(start).format('YYYY-MM-DD HH:mm:ss');

                const finish = moment(end).format('YYYY-MM-DD HH:mm:ss');

                let period = '';

                this.translate.get(this.constant.K_LINE_PERIOD.find(item => item.id === klinePeriodId).period).subscribe(res => period = res);

                if (!!platformOptions && platformOptions.length > 0) {
                    return ` start: ${begin},\n end: ${finish},\n period: ${period},\n exchanges: ${JSON.stringify(platformOptions)}`;
                } else {
                    return ` start: ${begin},\n end: ${finish},\n period: ${period}`;
                }
            });
    }

    /* =======================================================Local state change======================================================= */

    resetState(): void {
        this.store.dispatch(new ResetStateAction());
    }

    updateSelectedTemplates(ids: Observable<number[]>): Subscription {
        return ids.subscribe(ids => this.store.dispatch(new UpdateStrategyDependanceTemplatesAction(ids)));
    }

    updateSelectedLanguage(language: number): void {
        this.store.dispatch(new UpdateStrategyLanguageAction(language));
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

    isCommandArg = this.constant.isSpecialTypeArg(this.constant.COMMAND_PREFIX)

    /* =======================================================Error handler======================================================= */

    handleStrategyListError(): Subscription {
        return this.error.handleResponseError(this.getStrategyListResponse());
    }

    handleOpStrategyTokenError(): Subscription {
        return this.error.handleResponseError(this.getOpStrategyTokenResponse());
    }

    handleStrategyDetailError(): Subscription {
        return this.error.handleResponseError(this.getStrategyDetailResponse());
    }
}
