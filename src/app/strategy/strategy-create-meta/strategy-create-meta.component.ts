import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import * as fileSaver from 'file-saver';
import { isBoolean, isEmpty, negate } from 'lodash';
import { from, merge, Observable, of, Subject, Subscription, concat, combineLatest } from 'rxjs';
import { first, map, mapTo, mergeMap, startWith, switchMap, take } from 'rxjs/operators';

import { BacktestService } from '../../backtest/providers/backtest.service';
import { CanDeactivateComponent } from '../../base/guard.service';
import { Breadcrumb, DeactivateGuard, VariableOverview } from '../../interfaces/app.interface';
import { CategoryType, needArgsType, SaveStrategyRequest } from '../../interfaces/request.interface';
import { Strategy, StrategyDetail, StrategyListByNameStrategy } from '../../interfaces/response.interface';
import { BtNodeService } from '../../providers/bt-node.service';
import { TipService } from '../../providers/tip.service';
import { StrategyMetaArg } from '../../strategy/add-arg/add-arg.component';
import { ArgListComponent } from '../../strategy/arg-list/arg-list.component';
import { StrategyConstantService } from '../../strategy/providers/strategy.constant.service';
import { StrategyOperateService } from '../../strategy/providers/strategy.operate.service';
import {
    CodeContent, FileContent, StrategyCodemirrorComponent
} from '../../strategy/strategy-codemirror/strategy-codemirror.component';
import { StrategyDependanceComponent, TemplateRefItem } from '../../strategy/strategy-dependance/strategy-dependance.component';
import { StrategyDesComponent } from '../../strategy/strategy-des/strategy-des.component';
import { StrategyService } from '../providers/strategy.service';
import { BacktestConfigInCode } from '../../backtest/backtest.interface';

export interface Tab {
    name: string;
    icon: string;
    active: boolean;
}

export type CommonStrategy = Strategy | StrategyListByNameStrategy | StrategyDetail;

@Component({
    selector: 'app-strategy-create-meta',
    templateUrl: './strategy-create-meta.component.html',
    styleUrls: ['./strategy-create-meta.component.scss'],
})
export class StrategyCreateMetaComponent implements CanDeactivateComponent {

    subscription$$: Subscription;

    paths: Breadcrumb[] = [{ name: 'STRATEGY_LIBRARY', path: '../../' }];

    tabs: Tab[] = [
        { name: 'STRATEGY_EDIT', icon: 'anticon-edit', active: true },
        { name: 'SIMULATE_BACKTEST', icon: 'anticon-rocket', active: false },
    ];

    forbiddenSubmit: Observable<boolean>;

    strategy: Observable<CommonStrategy>;

    name$: Subject<string> = new Subject();

    language$: Subject<number> = new Subject();

    category$: Subject<number> = new Subject();

    @ViewChild(StrategyDesComponent) StrategyDes: StrategyDesComponent;

    language: Observable<number>;

    category: Observable<number>;

    strategyDetail: Observable<StrategyDetail>;

    save$: Subject<boolean | CodeContent> = new Subject();

    export$: Subject<FileContent> = new Subject();

    @ViewChild(StrategyCodemirrorComponent) codeMirror: StrategyCodemirrorComponent;

    @ViewChild(StrategyDependanceComponent) dependance: StrategyDependanceComponent;

    args$: Subject<StrategyMetaArg> = new Subject();

    args: Observable<StrategyMetaArg | StrategyMetaArg[]>;

    commandArgs$: Subject<StrategyMetaArg> = new Subject();

    commandArgs: Observable<StrategyMetaArg | StrategyMetaArg[]>;

    removedCommandArg$: Subject<StrategyMetaArg> = new Subject();

    hasCommandArgs: Observable<boolean>;

    @ViewChild('strategyArgs') strategyArgs: ArgListComponent;

    @ViewChild('strategyCommandArgs') strategyCommandArgs: ArgListComponent;

    strategyId: number;

    isLoading: Observable<boolean>;

    isTemplateCategorySelected: Observable<boolean>;

    backtestConfig: Observable<BacktestConfigInCode>;

    isAlive = true;

    constructor(
        public backtestService: BacktestService,
        public constant: StrategyConstantService,
        public nodeService: BtNodeService,
        public route: ActivatedRoute,
        public strategyOptService: StrategyOperateService,
        public strategyService: StrategyService,
        public tipService: TipService,
    ) {
    }

    protected initialModel(isAddStrategy = false) {
        if (isAddStrategy) {
            this.initialAddStrategyModel();
        } else {
            this.initialCommonStrategyModel();
        }
    }

    private initialAddStrategyModel() {
        this.args = this.args$.asObservable();

        this.commandArgs = this.commandArgs$.asObservable();

        this.hasCommandArgs = this.commandArgs.pipe(
            map(res => Array.isArray(res) ? !!res.length : !!res)
        );

        this.isLoading = this.strategyService.isLoading();

        this.language = this.language$.pipe(
            startWith(0)
        );

        this.category = this.category$.pipe(
            startWith(0)
        );

        this.isTemplateCategorySelected = this.category.pipe(
            map(cat => cat === CategoryType.TEMPLATE_LIBRARY)
        );

        this.forbiddenSubmit = this.name$.pipe(
            map(name => isEmpty(name)),
            startWith(true)
        );
    }

    private initialCommonStrategyModel() {
        this.strategyId = +this.route.snapshot.paramMap.get('id');

        this.strategyDetail = this.strategyService.getStrategyDetail();

        this.strategy = merge(
            this.strategyService.getStrategies(),
            this.strategyService.getMarketStrategyList(),
        ).pipe(
            mergeMap(list => concat(from(list), this.strategyDetail)),
            first(item => item.id === this.strategyId),
        );

        this.args = merge(
            this.strategyService.getExistedStrategyArgs(negate(this.strategyService.isCommandArg())).pipe(
                map(args => args.map(this.transformToMetaArg))
            ),
            this.args$.pipe(
                map(item => ({ ...item }))
            )
        );

        this.commandArgs = merge(
            this.strategyService.getExistedStrategyArgs(this.strategyService.isCommandArg()).pipe(
                map(args => args.map(arg => this.transformToMetaArg({ ...arg, variableName: this.constant.withoutPrefix(arg.variableName, this.constant.COMMAND_PREFIX) })))
            ),
            this.commandArgs$.pipe(
                map(item => ({ ...item }))
            )
        );

        this.hasCommandArgs = this.commandArgs.pipe(
            map(res => Array.isArray(res) ? !!res.length : !!res)
        );

        this.isLoading = this.strategyService.isLoading();

        this.language = merge(
            this.strategy.pipe(
                map(strategy => strategy.language)
            ),
            this.language$
        );

        this.category = merge(
            this.strategy.pipe(
                map(strategy => strategy.category)
            ),
            this.category$
        );

        this.isTemplateCategorySelected = this.category.pipe(
            map(cat => cat === CategoryType.TEMPLATE_LIBRARY)
        );

        this.forbiddenSubmit = this.name$.pipe(
            map(name => isEmpty(name)),
            startWith(false)
        );

        this.backtestConfig = this.strategyService.getBacktestConfigInCode();
    }

    protected launch(isBacktest: boolean): void {
        const id = this.route.paramMap.pipe(
            map(data => ({ id: +data.get('id') })),
            take(1)
        );

        const keepAlive = () => this.isAlive;

        if (isBacktest) {
            this.strategyService.launchStrategyDetail(id);
        } else {
            this.subscription$$ = this.export$.asObservable()
                .subscribe(content => this.exportFile(content));

            this.strategyService.launchStrategyDetail(id);

            this.strategyService.launchStrategyList(of({ offset: -1, limit: -1, strategyType: -1, categoryType: CategoryType.TEMPLATE_LIBRARY, needArgsType: needArgsType.onlyStrategyArg }));

            this.nodeService.launchGetNodeList(of(true));

            this.strategyService.handleStrategyListError(keepAlive);

            this.strategyOptService.handleSaveStrategyError(keepAlive);
        }

        this.strategyService.handleStrategyDetailError(keepAlive);
    }

    protected getSaveParams(): Observable<SaveStrategyRequest> {
        return this.save$.asObservable().pipe(
            map(content => {
                const req = isBoolean(content) ?
                    {
                        code: this.codeMirror.codeContent,
                        note: this.codeMirror.noteContent,
                        des: this.codeMirror.desContent,
                        manual: this.codeMirror.manualContent,
                    } : content;

                return {
                    ...req,
                    id: this.strategyId,
                    name: this.StrategyDes.strategyName,
                    categoryId: this.StrategyDes.category,
                    languageId: this.StrategyDes.language,
                    args: this.getArgs(),
                    dependance: this.getDependance(),
                };
            })
        );
    }

    protected confirmBeforeRequest(id: number): Observable<SaveStrategyRequest> {
        return this.getSaveParams().pipe(
            map(params => ({ ...params, id })),
            switchMap(params => this.tipService.guardRiskOperate('STRATEGY_COPY_SAVE_CONFIRM').pipe(
                mapTo(params))
            )
        );
    }

    canDeactivate(): DeactivateGuard[] {
        const codeMirrorGuard: DeactivateGuard = {
            canDeactivate: of(!this.codeMirror.isCodeChanged()),
            message: 'DEPRECATE_UNSAVED_CHANGE_CONFIRM',
        };

        const backtestGuard: DeactivateGuard = {
            canDeactivate: this.backtestService.isBacktesting().pipe(
                map(isTesting => !isTesting),
                take(1)
            ),
            message: 'CONFIRM_LEAVE_REGARDLESS_BACKTESTING',
        };

        return [codeMirrorGuard, backtestGuard];
    }

    protected addCurrentPath(name: string, path?: string): void {
        this.paths.push({ name });

        if (path) this.paths[1].path = path;
    }

    protected exportFile(data: FileContent): void {
        const name = this.StrategyDes.strategyName;

        const { content, extensionName } = data;

        fileSaver.saveAs(content, name || 'strategy' + extensionName);
    }

    private transformToMetaArg(arg: VariableOverview): StrategyMetaArg {
        return {
            name: arg.variableName,
            des: arg.variableDes,
            type: arg.variableTypeId,
            comment: arg.variableComment,
            defaultValue: arg.originValue,
        };
    }

    private getArgs(): string {
        const args = this.strategyArgs.data.map(item => [item.name, item.des, item.comment, this.constant.addPrefix(item.defaultValue, item.type)]);

        const commandArgs = this.strategyCommandArgs ? this.strategyCommandArgs.data.map(item => [this.constant.COMMAND_PREFIX + item.name, item.des, item.comment, this.constant.addPrefix(item.defaultValue, item.type)]) : [];

        return JSON.stringify([...args, ...commandArgs]);
    }

    private getDependance(): number[] {
        if (this.dependance && this.dependance.data) {
            return this.dependance.data.filter(item => item.checked).map(item => item.id);
        } else {
            return [];
        }
    }

    protected getTemplateDependance(source: Observable<TemplateRefItem[]>): Observable<TemplateRefItem[]> {
        return combineLatest(
            source,
            this.language
        ).pipe(
            map(([templates, language]) => templates.filter(item => item.language === language))
        );
    }

    protected isShowTemplateDependance(templates: Observable<TemplateRefItem[]>): Observable<boolean> {
        return combineLatest(
            templates.pipe(
                map(list => !!list.length)
            ),
            this.isTemplateCategorySelected,
        ).pipe(
            map(([hasTemplates, isTemplateCategory]) => hasTemplates && !isTemplateCategory)
        );
    }

    storeCode() {
        const code = this.codeMirror.codeContent;

        this.strategyService.snapshotCode(code);
    }
}
