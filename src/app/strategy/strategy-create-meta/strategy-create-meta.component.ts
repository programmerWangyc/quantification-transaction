import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import * as fileSaver from 'file-saver';
import { isBoolean, isEmpty, negate } from 'lodash';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';
import { from, merge, Observable, of, Subject, Subscription } from 'rxjs';
import { filter, find, map, mapTo, mergeMap, startWith, switchMap, take } from 'rxjs/operators';

import { BacktestService } from '../../backtest/providers/backtest.service';
import { CanDeactivateComponent } from '../../base/guard.service';
import { Breadcrumb, DeactivateGuard, VariableOverview } from '../../interfaces/app.interface';
import { CategoryType, needArgsType, SaveStrategyRequest } from '../../interfaces/request.interface';
import { Strategy, StrategyDetail, StrategyListByNameStrategy } from '../../interfaces/response.interface';
import { BtNodeService } from '../../providers/bt-node.service';
import { StrategyMetaArg } from '../../strategy/add-arg/add-arg.component';
import { ArgListComponent } from '../../strategy/arg-list/arg-list.component';
import { StrategyConstantService } from '../../strategy/providers/strategy.constant.service';
import { StrategyOperateService } from '../../strategy/providers/strategy.operate.service';
import {
    CodeContent, FileContent, StrategyCodemirrorComponent
} from '../../strategy/strategy-codemirror/strategy-codemirror.component';
import { StrategyDependanceComponent } from '../../strategy/strategy-dependance/strategy-dependance.component';
import { StrategyDesComponent } from '../../strategy/strategy-des/strategy-des.component';
import { SimpleNzConfirmWrapComponent } from '../../tool/simple-nz-confirm-wrap/simple-nz-confirm-wrap.component';

export interface Tab {
    name: string;
    icon: string;
    active: boolean;
}

@Component({
    selector: 'app-strategy-create-meta',
    templateUrl: './strategy-create-meta.component.html',
    styleUrls: ['./strategy-create-meta.component.scss'],
})
export class StrategyCreateMetaComponent implements CanDeactivateComponent {

    // ===========================================UI state related============================================

    /**
     * @ignore
     */
    subscription$$: Subscription;

    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'CONTROL_CENTER' }, { name: 'STRATEGY_LIBRARY', path: '../../' }];

    /**
     * @ignore
     */
    tabs: Tab[] = [
        { name: 'STRATEGY_EDIT', icon: 'anticon-edit', active: true },
        { name: 'SIMULATE_BACKTEST', icon: 'anticon-rocket', active: false },
    ];

    /**
     * 禁用提交按钮；
     * 当策略的名称为空或都代码为空时禁止用户提交；
     */
    forbiddenSubmit: Observable<boolean>;

    // ==================================Used for interact with StrategyDesComponent================================

    /**
     * Strategy data;
     */
    strategy: Observable<Strategy | StrategyListByNameStrategy>;

    /**
     * Strategy name;
     */
    name$: Subject<string> = new Subject();

    /**
     * Strategy language;
     */
    language$: Subject<number> = new Subject();

    /**
     * Strategy category;
     */
    category$: Subject<number> = new Subject();

    /**
     * @ignore
     */
    @ViewChild(StrategyDesComponent) StrategyDes: StrategyDesComponent;

    /**
     * Language in these observable comes from api response and component output;
     */
    language: Observable<number>;

    /**
     * Category in these observable comes from api response and component output;
     */
    category: Observable<number>;

    // ========================== Used for interact with StrategyCodeMirrorComponent========================

    /**
     * Strategy detail
     */
    strategyDetail: Observable<StrategyDetail>;

    /**
     * Save strategy signal;
     */
    save$: Subject<boolean | CodeContent> = new Subject();

    /**
     * Download strategy signal;
     */
    export$: Subject<FileContent> = new Subject();

    /**
     * @ignore
     */
    @ViewChild(StrategyCodemirrorComponent) codeMirror: StrategyCodemirrorComponent;

    /**
     * @ignore
     */
    @ViewChild(StrategyDependanceComponent) dependance: StrategyDependanceComponent;

    // ==========================Used for interact with AddArgComponent and ArgListComponent======================

    /**
     * Args outputted by other component
     */
    args$: Subject<StrategyMetaArg> = new Subject();

    /**
     * Strategy args;
     */
    args: Observable<StrategyMetaArg | StrategyMetaArg[]>;

    /**
     * Command args outputted by other component;
     */
    commandArgs$: Subject<StrategyMetaArg> = new Subject();

    /**
     * Command args;
     */
    commandArgs: Observable<StrategyMetaArg | StrategyMetaArg[]>;

    /**
     * Removed command args;
     */
    removedCommandArg$: Subject<StrategyMetaArg> = new Subject();

    /**
     * Wether had command args;
     */
    hasCommandArgs: Observable<boolean>;

    /**
     * @ignore
     */
    @ViewChild('strategyArgs') strategyArgs: ArgListComponent;

    /**
     * @ignore
     */
    @ViewChild('strategyCommandArgs') strategyCommandArgs: ArgListComponent;

    /**
     * Comes from router;
     */
    strategyId: number;

    /**
     * Loading state, if true when requesting and false after received response;
     */
    isLoading: Observable<boolean>;

    /**
     * Whether the category is template;
     */
    isTemplateCategorySelected: Observable<boolean>;

    constructor(
        public route: ActivatedRoute,
        public strategyService: StrategyOperateService,
        public nodeService: BtNodeService,
        public nzModal: NzModalService,
        public constant: StrategyConstantService,
        public backtestService: BacktestService,
    ) {
    }

    /**
     * @ignore
     */
    protected initialModel(isAddStrategy = false) {
        if (isAddStrategy) {
            this.initialAddStrategyModel();
        } else {
            this.initialCommonStrategyModel();
        }
    }

    /**
     * Initial model if add strategy;
     */
    private initialAddStrategyModel() {
        this.args = this.args$.asObservable();

        this.commandArgs = this.commandArgs$.asObservable();

        this.hasCommandArgs = this.commandArgs.pipe(
            map(res => Array.isArray(res) ? !!res.length : !!res)
        );

        this.isLoading = this.strategyService.isLoading();

        /**
         * Multi source observables;
         */
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

    /**
     * Initial model if edit, copy strategy;
     */
    private initialCommonStrategyModel() {
        this.strategyId = +this.route.snapshot.paramMap.get('id');

        /**
         * 这里的信息没有从detail里取，因为通过编辑或复制按钮进来时，从list上来取这些信息时更快，不需要等后台响应就可以拿到。
         */
        this.strategy = merge(
            this.strategyService.getStrategies() as Observable<StrategyListByNameStrategy[]>,
            this.strategyService.getMarketStrategyList(),
        ).pipe(
            mergeMap(list => from(list)),
            find(item => item.id === this.strategyId)
        );

        /**
         * 当前策略的详细信息由响应数据提供。
         */
        this.strategyDetail = this.strategyService.getStrategyDetail();

        /**
         * 主要是提供给参数列表组件使用，它的数据来源于响应中已有的参数及AddArgComponent输出的数据。
         * !FIXME: 直接订阅时subject时，无法传递相同的数据，map 函数中的值不使用扩展运算符时也一样，
         * 类似于distinct的效果，但是翻了下 async 的源码没有看到相关的设置，困惑！
         */
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

        /**
         * loading 状态控制
         */
        this.isLoading = this.strategyService.isLoading();

        /**
         * Multi source observables;
         */
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
    }

    /**
     * @param isBacktest Whether route comes from backtest;
     */
    protected launch(isBacktest: boolean): void {
        const id = this.route.paramMap.pipe(
            map(data => ({ id: +data.get('id') }))
        );

        if (isBacktest) {
            this.subscription$$ = this.strategyService.handleStrategyDetailError()
                .add(this.strategyService.launchStrategyDetail(id));
        } else {
            this.subscription$$ = this.strategyService.handleStrategyDetailError()
                .add(this.strategyService.handleStrategyListError())
                .add(this.strategyService.handleSaveStrategyError())

                // 响应用户导出文件的操作
                .add(this.export$.subscribe(content => this.exportFile(content)))
                // 获取当前策略详情
                .add(this.strategyService.launchStrategyDetail(id))
                // 只获取属于模板类库的策略
                .add(this.strategyService.launchStrategyList(of({ offset: -1, limit: -1, strategyType: -1, categoryType: CategoryType.TEMPLATE_LIBRARY, needArgsType: needArgsType.onlyStrategyArg })))

                .add(this.nodeService.launchGetNodeList(of(true)));
        }
    }

    /**
     * Get save strategy request params;
     */
    protected getSaveParams(): Observable<SaveStrategyRequest> {
        return this.save$.pipe(
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

    /**
     * 发起请求前提醒用户确认；
     * @param id strategy id;
     * @returns 请求参数
     */
    protected confirmBeforeRequest(id: number): Observable<SaveStrategyRequest> {
        return this.getSaveParams().pipe(
            map(params => ({ ...params, id })),
            switchMap(params => {
                const modal: NzModalRef = this.nzModal.confirm({
                    nzContent: SimpleNzConfirmWrapComponent,
                    nzComponentParams: { content: 'STRATEGY_COPY_SAVE_CONFIRM' },
                    nzOnOk: () => modal.close(true),
                });

                return modal.afterClose.pipe(
                    filter(sure => !!sure),
                    mapTo(params)
                );
            })
        );
    }

    /**
     * Router guard.
     */
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

    /**
     * 提供给子类使用，完善当前的路径信息。
     */
    protected addCurrentPath(name): void {
        this.paths.push({ name });
    }

    /**
     * Download strategy code;
     */
    protected exportFile(data: FileContent): void {
        const name = this.StrategyDes.strategyName;

        const { content, extensionName } = data;

        fileSaver.saveAs(content, name || 'strategy' + extensionName);
    }

    /**
     * @ignore
     */
    private transformToMetaArg(arg: VariableOverview): StrategyMetaArg {
        return {
            name: arg.variableName,
            des: arg.variableDes,
            type: arg.variableTypeId,
            comment: arg.variableComment,
            defaultValue: arg.originValue,
        };
    }

    /**
     * Get strategy args;
     */
    private getArgs(): string {
        const args = this.strategyArgs.data.map(item => [item.name, item.des, item.comment, this.constant.addPrefix(item.defaultValue, item.type)]);

        const commandArgs = this.strategyCommandArgs.data.map(item => [this.constant.COMMAND_PREFIX + item.name, item.des, item.comment, this.constant.addPrefix(item.defaultValue, item.type)]);

        return JSON.stringify([...args, ...commandArgs]);
    }

    /**
     * Get strategy dependance template ids;
     */
    private getDependance(): number[] {
        if (this.dependance && this.dependance.data) {
            return this.dependance.data.filter(item => item.checked).map(item => item.id);
        } else {
            return [];
        }
    }
}
