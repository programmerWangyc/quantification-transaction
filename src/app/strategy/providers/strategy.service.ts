import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { intersectionWith, uniqBy } from 'lodash';
import * as moment from 'moment';
import { combineLatest, from, Observable, of, Subscription } from 'rxjs';
import { filter, find, map, mergeMap, switchMap, take, takeWhile, withLatestFrom } from 'rxjs/operators';

import { BacktestConfigInCode, BacktestSelectedPair } from '../../backtest/backtest.interface';
import { BaseService } from '../../base/base.service';
import { keepAliveFn, VariableOverview } from '../../interfaces/app.interface';
import * as fromReq from '../../interfaces/request.interface';
import * as fromRes from '../../interfaces/response.interface';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import { TipService } from '../../providers/tip.service';
import * as fromRoot from '../../store/index.reducer';
import {
    ResetStateAction, SnapshotCodeAction, UpdateStrategyDependanceTemplatesAction, UpdateStrategyLanguageAction,
    UpdateStrategySecretKeyStateAction
} from '../../store/strategy/strategy.action';
import { TemplateRefItem } from '../strategy-dependance/strategy-dependance.component';
import { Language, OpStrategyTokenTypeAdapter } from '../strategy.config';
import { StrategyConstantService } from './strategy.constant.service';

@Injectable()
export class StrategyService extends BaseService {

    constructor(
        private constant: StrategyConstantService,
        private error: ErrorService,
        private process: ProcessService,
        private store: Store<fromRoot.AppState>,
        private tipService: TipService,
        private translate: TranslateService,
    ) {
        super();
    }


    launchStrategyList(source: Observable<fromReq.GetStrategyListRequest>): Subscription {
        return this.process.processStrategyList(source);
    }

    launchOpStrategyToken(sourceObs: Observable<fromReq.OpStrategyTokenRequest>): Subscription {
        return this.process.processOpStrategyToken(sourceObs.pipe(
            switchMap(source => source.opCode === OpStrategyTokenTypeAdapter.GET ? of(source)
                : this.tipService.guardRiskOperate(source.opCode === OpStrategyTokenTypeAdapter.ADD ? 'GEN_SECRET_KEY_CONFIRM' : 'UPDATE_SECRET_KEY_CONFIRM').pipe(
                    map(_ => ({ strategyId: source.strategyId, opCode: this.constant.adaptedOpStrategyTokenType(source.opCode) }))
                )
            )
        ));
    }

    launchStrategyDetail(source: Observable<fromReq.GetStrategyDetailRequest>): Subscription {
        return this.process.processStrategyDetail(source);
    }


    private getStrategyListResponse(): Observable<fromRes.GetStrategyListResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectStrategyListResponse)
        );
    }

    getStrategies(): Observable<fromRes.Strategy[]> {
        return this.getStrategyListResponse().pipe(
            map(res => res.result.strategies)
        );
    }

    private getOpStrategyTokenResponse(): Observable<fromRes.OpStrategyTokenResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectOpStrategyTokenResponse)
        );
    }

    getStrategyToken(): Observable<string> {
        return this.getOpStrategyTokenResponse().pipe(
            map(res => res.result)
        );
    }

    updateStrategySecretKeyState(id: number): Subscription {
        return this.getOpStrategyTokenResponse().pipe(
            map(res => !!res.result)
        ).subscribe(hasToken => this.store.dispatch(new UpdateStrategySecretKeyStateAction({ id, hasToken })));
    }

    private getStrategyDetailResponse(): Observable<fromRes.GetStrategyDetailResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectStrategyDetailResponse)
        );
    }

    getStrategyDetail(): Observable<fromRes.StrategyDetail> {
        return this.getStrategyDetailResponse().pipe(
            map(res => res.result.strategy)
        );
    }

    getStrategyDependance(): Observable<TemplateRefItem[]> {
        return combineLatest(
            this.getAvailableDependance(),
            this.getCurrentDependance()
        ).pipe(
            map(([available, current]) => {
                const intersection = intersectionWith(available, current, (a, c) => a.id === c.id).map(item => item.id);

                const result = uniqBy(available.concat(current), 'id');

                return result.map(item => intersection.includes(item.id) ? { ...item, checked: true } : item);
            })
        );
    }

    getAvailableDependance(isAddStrategy = false): Observable<TemplateRefItem[]> {
        return this.getStrategies().pipe(
            withLatestFrom(
                !isAddStrategy ? this.getStrategyDetail().pipe(
                    map(item => item.id)
                ) : of(null),
                (strategies, targetId) => strategies
                    .map(({ name, id, category, language }) => ({ name, id, checked: false, isSnapshot: category === fromReq.CategoryType.TEMPLATE_SNAPSHOT, language }))
                    .filter(item => item.id !== targetId)
            )
        );
    }

    getCurrentDependance(): Observable<TemplateRefItem[]> {
        return this.getStrategyDetail().pipe(
            map(detail => detail.templates ? detail.templates.map(tpl => {
                const { name, id, category, language } = tpl;

                if (category === fromReq.CategoryType.TEMPLATE_SNAPSHOT) {
                    return { name: name.split('-')[1], id, checked: true, isSnapshot: true, language };
                } else {
                    return { name, id, checked: true, isSnapshot: false, language };
                }
            }) : [])
        );
    }

    isLoading(): Observable<boolean> {
        return this.store.pipe(
            select(fromRoot.selectStrategyUIState),
            map(state => state.loading),
            this.loadingTimeout(this.tipService.loadingSlowlyTip)
        );
    }

    getExistedStrategyArgs(predicate: (s: string) => boolean): Observable<VariableOverview[]> {
        return this.getStrategyDetail().pipe(
            map(detail => detail.semanticArgs.filter(arg => predicate(arg.variableName)))
        );
    }

    generateBacktestConfig(): Observable<string> {
        return this.store.pipe(
            select(fromRoot.selectBacktestUIState),
            map(state => {
                const { timeOptions, platformOptions } = state;

                const { start, end, klinePeriodId } = timeOptions;

                const begin = moment(start).format('YYYY-MM-DD HH:mm:ss');

                const finish = moment(end).format('YYYY-MM-DD HH:mm:ss');

                let period = '';

                this.translate.get(this.constant.K_LINE_PERIOD.find(item => item.id === klinePeriodId).period).subscribe(res => period = res);

                if (!!platformOptions && platformOptions.length > 0) {
                    return ` start: ${begin},\n end: ${finish},\n period: ${period},\n exchanges: ${JSON.stringify(platformOptions)}`;
                } else {
                    return ` start: ${begin},\n end: ${finish},\n period: ${period}`;
                }
            })
        );
    }

    getBacktestConfigInCode(): Observable<BacktestConfigInCode> {
        return this.getStrategyDetail().pipe(
            take(1),
            map(strategy => {
                if (!strategy.source) return null;

                const { source, language } = strategy;

                const reg = language === Language.Python ? this.constant.pyCommentReg : this.constant.jsCommentReg;

                if (!reg.test(source)) return null;

                const comment = source.match(reg)[0];

                const info = comment.split('\n').slice(1, -1);

                const timeReg = /\d{4}(-\d{2}){2}\s(\d{2}:){2}\d{2}/;

                const start = info[0].match(timeReg)[0];

                const end = info[1].match(timeReg)[0];

                const klinePeriodReg = /\d{1,2}.*[^,]/;

                const klinePeriodId = this.findKlineId(info[2].match(klinePeriodReg)[0]);

                const platformOptions = info[3] ? JSON.parse(info[3].match(/\[.*\]/)[0]) as BacktestSelectedPair[] : null;

                return { timeConfig: { start: new Date(start), end: new Date(end), klinePeriodId }, platformOptions };
            }),
            this.filterTruth()
        );
    }

    private findKlineId(source: string): number {
        let result = null;

        from(this.constant.K_LINE_PERIOD).pipe(
            mergeMap(item => this.translate.get(item.period).pipe(
                map(period => ({ ...item, period }))
            )),
            find(item => this.constant.isPeriodEqual(item.period, source)),
            map(item => item.id)
        ).subscribe(id => result = id);

        return result;
    }

    private getStrategyListByNameResponse(): Observable<fromRes.GetStrategyListByNameResponse> {
        return this.store.pipe(
            select(fromRoot.selectStrategyListByNameResponse),
            filter(res => !!res && !!res.result)
        );
    }

    getMarketStrategyList(): Observable<fromRes.StrategyListByNameStrategy[]> {
        return this.getStrategyListByNameResponse().pipe(
            map(res => res.result.strategies)
        );
    }

    resetState(): void {
        this.store.dispatch(new ResetStateAction());
    }

    updateSelectedTemplates(idObs: Observable<number[]>): Subscription {
        return idObs.subscribe(ids => this.store.dispatch(new UpdateStrategyDependanceTemplatesAction(ids)));
    }

    updateSelectedLanguage(language: number): void {
        this.store.dispatch(new UpdateStrategyLanguageAction(language));
    }

    snapshotCode(code: string): void {
        this.store.dispatch(new SnapshotCodeAction(code));
    }

    getSpecificStrategies(predicate: (data: fromRes.Strategy) => boolean): Observable<fromRes.Strategy[]> {
        return this.getStrategies().pipe(
            map(strategies => strategies.filter(predicate))
        );
    }

    hasToken(id: number): Observable<boolean> {
        return this.getStrategies().pipe(
            mergeMap(list => from(list)),
            find(strategy => strategy.id === id),
            map(strategy => strategy.hasToken),
            take(1)
        );
    }

    isCommandArg() {
        return this.constant.isSpecialTypeArg(this.constant.COMMAND_PREFIX);
    }

    handleStrategyListError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getStrategyListResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    handleOpStrategyTokenError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getOpStrategyTokenResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    handleStrategyDetailError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getStrategyDetailResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
}
