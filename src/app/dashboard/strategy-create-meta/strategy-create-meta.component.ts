import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as fileSaver from 'file-saver';
import { isBoolean, negate } from 'lodash';
import { NzModalService } from 'ng-zorro-antd';
import { Observable } from 'rxjs/Observable';
import { from } from 'rxjs/observable/from';
import { of } from 'rxjs/observable/of';
import { find, map } from 'rxjs/operators';
import { mergeMap } from 'rxjs/operators/mergeMap';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { Breadcrumb, VariableOverview } from '../../interfaces/app.interface';
import { CategoryType, needArgsType, SaveStrategyRequest } from '../../interfaces/request.interface';
import { StrategyDetail, Strategy } from '../../interfaces/response.interface';
import { BtNodeService } from '../../providers/bt-node.service';
import { StrategyMetaArg } from '../../strategy/add-arg/add-arg.component';
import { ArgListComponent } from '../../strategy/arg-list/arg-list.component';
import { StrategyOperateService } from '../../strategy/providers/strategy.operate.service';
import {
    CodeContent,
    FileContent,
    StrategyCodemirrorComponent,
} from '../../strategy/strategy-codemirror/strategy-codemirror.component';
import { StrategyDesComponent } from '../../strategy/strategy-des/strategy-des.component';
import { Language } from '../../strategy/strategy.config';
import { StrategyConstantService } from '../../strategy/providers/strategy.constant.service';

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
export class StrategyCreateMetaComponent implements AfterViewInit {

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

    save$$: Subscription;

    /**
     * @description Used for interact with StrategyDependanceComponent;
     */
    selectedTemplates$: Subject<number[]> = new Subject();

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
    ) { }

    initialModel() {
        this.strategyId = +this.route.snapshot.paramMap.get('id');

        /**
         * @description 这里的信息没有从detail里取，因为通过编辑或复制按钮进来时，从list上来取这些信息时更快，不需要等后台响应就可以拿到。
         */
        this.strategy = this.strategyService.getStrategies()
            .pipe(mergeMap(list => from(list)), find(item => item.id === this.strategyId));

        /**
         * @description 当前策略的详细信息由响应数据提供。
         */
        this.strategyDetail = this.strategyService.getStrategyDetail();

        /**
         * @description 主要是提供给参数列表组件使用，它的数据来源于响应中已有的参数及AddArgComponent输出的数据。
         *  FIXME: 直接订阅时subject时，无法传递相同的数据，map 函数中的值不使用扩展运算符时也一样，
         *  类似于distinct的效果，但是翻了下 async 的源码没有看到相关的设置，困惑！
         */
        this.args = this.strategyService.getExistedStrategyArgs(negate(this.strategyService.isCommandArg))
            .map(args => args.map(this.transformToMetaArg))
            .merge(this.args$.map(item => ({ ...item })));

        this.commandArgs = this.strategyService.getExistedStrategyArgs(this.strategyService.isCommandArg)
            .map(args => args.map(arg => this.transformToMetaArg({ ...arg, variableName: this.constant.withoutPrefix(arg.variableName, this.constant.COMMAND_PREFIX) })))
            .merge(this.commandArgs$.map(item => ({ ...item })));

        this.hasCommandArgs = this.commandArgs.map(res => Array.isArray(res) ? !!res.length : !!res);

        /**
         * @description loading 状态控制
         */
        this.isLoading = this.strategyService.isLoading();

        /**
         * @description Multi source observables;
         */
        this.language = this.strategy.map(strategy => strategy.language).merge(this.language$);

        this.category = this.strategy.map(strategy => strategy.category).merge(this.category$);

        this.isTemplateCategorySelected = this.category.map(cat => cat === CategoryType.TEMPLATE_LIBRARY);
    }

    launch(isBacktest: boolean): void {
        const id = this.route.paramMap.map(data => +data.get('id'));

        if (isBacktest) {
            this.subscription$$ = this.strategyService.handleStrategyDetailError()
                .add(this.strategyService.launchStrategyDetail(id.map(id => ({ id }))))
        } else {
            this.subscription$$ = this.strategyService.handleStrategyDetailError()
                .add(this.strategyService.handleStrategyListError())
                .add(this.strategyService.handleSaveStrategyError())

                // 响应用户导出文件的操作
                .add(this.export$.subscribe(content => this.exportFile(content)))
                // 获取当前策略详情
                .add(this.strategyService.launchStrategyDetail(id.map(id => ({ id }))))
                // 只获取属于模板类库的策略
                .add(this.strategyService.launchStrategyList(of({ offset: -1, limit: -1, strategyType: -1, categoryType: CategoryType.TEMPLATE_LIBRARY, needArgsType: needArgsType.onlyStrategyArg })))

                .add(this.nodeService.launchGetNodeList(of(true), true));
        }
    }

    ngAfterViewInit() {
        /**
         * @description 保存操作需要保证子组件渲染完成，因为除了从组件发送上来的保存事件外，用户还可以通过其它地方的按钮来触发保存行为，
         * 此时就需要主动获取数据。
         */
        this.save$$ = this.strategyService.launchSaveStrategy(this.save$.map(content => isBoolean(content) ? { code: this.codeMirror.codeContent, note: this.codeMirror.noteContent, des: this.codeMirror.desContent, manual: this.codeMirror.manualContent } : content).switchMap(code => this.getSaveStrategyParams(code)))
    }

    /**
     * @description Router guard.
     */
    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        return !this.codeMirror.isCodeChanged();
    }

    /**
     * @param code - Content of StrategyCodeMirrorComponent editable area, includes code, note, description and manual.
     * @description Generate request params when save action arrived.
     */
    getSaveStrategyParams(code: CodeContent): Observable<SaveStrategyRequest> {
        const args = JSON.stringify(this.strategyArgs.data.concat(this.strategyCommandArgs.data));

        return of(this.strategyId).withLatestFrom(
            ...[
                this.name$.startWith(''), // empty
                this.category$.startWith(CategoryType.COMMODITY_FUTURES),
                this.language$.startWith(Language.JavaScript),
                this.selectedTemplates$.startWith([])
            ],
            (id, name, categoryId, languageId, dependance) => ({ id, name, categoryId, languageId, args, ...code, dependance })
        );
    }

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

    private accumulateArg = (acc: StrategyMetaArg[], cur: StrategyMetaArg) => {
        return [...acc, cur];
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
}
