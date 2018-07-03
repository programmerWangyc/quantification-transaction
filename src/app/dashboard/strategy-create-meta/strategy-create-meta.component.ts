import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as fileSaver from 'file-saver';
import { isBoolean, negate } from 'lodash';
import { NzModalService } from 'ng-zorro-antd';
import { from, merge, Observable, of, Subject, Subscription } from 'rxjs';
import { find, map, mergeMap, take } from 'rxjs/operators';

import { BacktestService } from '../../backtest/providers/backtest.service';
import { Breadcrumb, VariableOverview } from '../../interfaces/app.interface';
import { CategoryType, needArgsType, SaveStrategyRequest } from '../../interfaces/request.interface';
import { Strategy, StrategyDetail } from '../../interfaces/response.interface';
import { BtNodeService } from '../../providers/bt-node.service';
import { StrategyMetaArg } from '../../strategy/add-arg/add-arg.component';
import { ArgListComponent } from '../../strategy/arg-list/arg-list.component';
import { StrategyConstantService } from '../../strategy/providers/strategy.constant.service';
import { StrategyOperateService } from '../../strategy/providers/strategy.operate.service';
import {
    CodeContent,
    FileContent,
    StrategyCodemirrorComponent,
} from '../../strategy/strategy-codemirror/strategy-codemirror.component';
import { StrategyDependanceComponent } from '../../strategy/strategy-dependance/strategy-dependance.component';
import { StrategyDesComponent } from '../../strategy/strategy-des/strategy-des.component';
import { StrategyDetailDeactivateGuard } from '../dashboard.interface';
import { CanDeactivateComponent } from '../providers/guard.service';

export interface Tab {
    name: string;
    icon: string;
    active: boolean;
}

@Component({
    selector: 'app-strategy-create-meta',
    templateUrl: './strategy-create-meta.component.html',
    styleUrls: ['./strategy-create-meta.component.scss']
})
export class StrategyCreateMetaComponent implements CanDeactivateComponent {

    /**
     * @description UI state related.
     */
    subscription$$: Subscription;

    paths: Breadcrumb[] = [{ name: 'CONTROL_CENTER' }, { name: 'STRATEGY_LIBRARY', path: '../../' }];

    tabs: Tab[] = [
        { name: 'STRATEGY_EDIT', icon: 'anticon-edit', active: true },
        { name: 'SIMULATE_BACKTEST', icon: 'anticon-rocket', active: false }
    ];

    /**
     * @description Used for interact with StrategyDesComponent;
     */
    strategy: Observable<Strategy>;

    name$: Subject<string> = new Subject();

    language$: Subject<number> = new Subject();

    category$: Subject<number> = new Subject();

    @ViewChild(StrategyDesComponent) StrategyDes: StrategyDesComponent;

    /**
     * @description Data in these observable comes from api response and component output;
     */
    language: Observable<number>;

    category: Observable<number>;

    /**
     * @description Used for interact with StrategyCodeMirrorComponent;
     */
    strategyDetail: Observable<StrategyDetail>;

    save$: Subject<boolean | CodeContent> = new Subject();

    export$: Subject<FileContent> = new Subject();

    @ViewChild(StrategyCodemirrorComponent) codeMirror: StrategyCodemirrorComponent;

    @ViewChild(StrategyDependanceComponent) dependance: StrategyDependanceComponent;

    /**
     * @description Used for interact with AddArgComponent and ArgListComponent
     */
    args$: Subject<StrategyMetaArg> = new Subject();

    args: Observable<StrategyMetaArg | StrategyMetaArg[]>;

    commandArgs$: Subject<StrategyMetaArg> = new Subject();

    commandArgs: Observable<StrategyMetaArg | StrategyMetaArg[]>;

    removedCommandArg$: Subject<StrategyMetaArg> = new Subject();

    hasCommandArgs: Observable<boolean>;

    @ViewChild('strategyArgs') strategyArgs: ArgListComponent;

    @ViewChild('strategyCommandArgs') strategyCommandArgs: ArgListComponent;

    /**
     * @description Comes from router;
     */
    strategyId: number;

    /**
     * @description Loading state, if true when requesting and false after received response;
     */
    isLoading: Observable<boolean>;

    isTemplateCategorySelected: Observable<boolean>;

    constructor(
        public route: ActivatedRoute,
        public strategyService: StrategyOperateService,
        public nodeService: BtNodeService,
        public nzModal: NzModalService,
        public constant: StrategyConstantService,
        public backtestService: BacktestService,
    ) { }

    initialModel() {
        this.strategyId = +this.route.snapshot.paramMap.get('id');

        /**
         * @description 这里的信息没有从detail里取，因为通过编辑或复制按钮进来时，从list上来取这些信息时更快，不需要等后台响应就可以拿到。
         */
        this.strategy = this.strategyService.getStrategies()
            .pipe(
                mergeMap(list => from(list)),
                find(item => item.id === this.strategyId)
            );

        /**
         * @description 当前策略的详细信息由响应数据提供。
         */
        this.strategyDetail = this.strategyService.getStrategyDetail();

        /**
         * @description 主要是提供给参数列表组件使用，它的数据来源于响应中已有的参数及AddArgComponent输出的数据。
         *  FIXME: 直接订阅时subject时，无法传递相同的数据，map 函数中的值不使用扩展运算符时也一样，
         *  类似于distinct的效果，但是翻了下 async 的源码没有看到相关的设置，困惑！
         */
        this.args = merge(
            this.strategyService.getExistedStrategyArgs(negate(this.strategyService.isCommandArg))
                .pipe(
                    map(args => args.map(this.transformToMetaArg))
                ),
            this.args$
                .pipe(
                    map(item => ({ ...item }))
                )
        );

        this.commandArgs = merge(
            this.strategyService.getExistedStrategyArgs(this.strategyService.isCommandArg)
                .pipe(
                    map(args => args.map(arg => this.transformToMetaArg({ ...arg, variableName: this.constant.withoutPrefix(arg.variableName, this.constant.COMMAND_PREFIX) })))
                ),

            this.commandArgs$
                .pipe(
                    map(item => ({ ...item }))
                )
        );

        this.hasCommandArgs = this.commandArgs
            .pipe(
                map(res => Array.isArray(res) ? !!res.length : !!res)
            );

        /**
         * @description loading 状态控制
         */
        this.isLoading = this.strategyService.isLoading();

        /**
         * @description Multi source observables;
         */
        this.language = merge(
            this.strategy
                .pipe(
                    map(strategy => strategy.language)
                ),
            this.language$
        );

        this.category = merge(
            this.strategy
                .pipe(
                    map(strategy => strategy.category)
                ),
            this.category$
        );

        this.isTemplateCategorySelected = this.category
            .pipe(
                map(cat => cat === CategoryType.TEMPLATE_LIBRARY)
            );
    }

    launch(isBacktest: boolean): void {
        const id = this.route.paramMap
            .pipe(
                map(data => ({ id: +data.get('id') }))
            );

        if (isBacktest) {
            this.subscription$$ = this.strategyService.handleStrategyDetailError()
                .add(this.strategyService.launchStrategyDetail(id))
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

                .add(this.nodeService.launchGetNodeList(of(true), true));
        }
    }

    getSaveParams(): Observable<SaveStrategyRequest> {
        return this.save$
            .pipe(
                map(content => {
                    const req = isBoolean(content) ?
                        {
                            code: this.codeMirror.codeContent,
                            note: this.codeMirror.noteContent,
                            des: this.codeMirror.desContent,
                            manual: this.codeMirror.manualContent
                        } : content;

                    return {
                        ...req,
                        id: this.strategyId,
                        name: this.StrategyDes.strategyName,
                        categoryId: this.StrategyDes.category,
                        languageId: this.StrategyDes.language,
                        args: this.getArgs(),
                        dependance: this.getDependance()
                    }
                })
            );
    }

    /**
     * @description Router guard.
     */
    canDeactivate(): StrategyDetailDeactivateGuard[] {
        const codeMirrorGuard: StrategyDetailDeactivateGuard = {
            canDeactivate: of(!this.codeMirror.isCodeChanged()),
            message: 'DEPRECATE_UNSAVED_CHANGE_CONFIRM',
        };

        const backtestGuard: StrategyDetailDeactivateGuard = {
            canDeactivate: this.backtestService.isBacktesting().pipe(
                map(isTesting => !isTesting),
                take(1)
            ),
            message: 'CONFIRM_LEAVE_REGARDLESS_BACKTESTING',
        }

        return [codeMirrorGuard, backtestGuard];
    }

    /**
    /**
     * @method addCurrentPath
     * @description 提供给子类使用，完善当前的路径信息。
     */
    addCurrentPath(name): void {
        this.paths.push({ name });
    }

    private exportFile(data: FileContent): void {
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
            defaultValue: arg.originValue
        }
    }

    private getArgs(): string {
        const args = this.strategyArgs.data.map(item => [item.name, item.des, item.comment, this.constant.addPrefix(item.defaultValue, item.type)])

        const commandArgs = this.strategyCommandArgs.data.map(item => [this.constant.COMMAND_PREFIX + item.name, item.des, item.comment, this.constant.addPrefix(item.defaultValue, item.type)]);

        return JSON.stringify([...args, ...commandArgs]);
    }

    private getDependance(): number[] {
        if (this.dependance && this.dependance.data) {
            return this.dependance.data.filter(item => item.checked).map(item => item.id);
        } else {
            return [];
        }
    }
}
