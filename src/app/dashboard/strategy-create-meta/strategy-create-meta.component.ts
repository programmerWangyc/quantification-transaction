import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as fileSaver from 'file-saver';
import { isBoolean } from 'lodash';
import { NzModalService } from 'ng-zorro-antd';
import { Observable } from 'rxjs/Observable';
import { from } from 'rxjs/observable/from';
import { of } from 'rxjs/observable/of';
import { find, map } from 'rxjs/operators';
import { mergeMap } from 'rxjs/operators/mergeMap';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { Breadcrumb } from '../../interfaces/app.interface';
import { CategoryType, needArgsType, SaveStrategyRequest } from '../../interfaces/request.interface';
import { StrategyDetail } from '../../interfaces/response.interface';
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

    subscription$$: Subscription;

    paths: Breadcrumb[] = [{ name: 'CONTROL_CENTER' }, { name: 'STRATEGY_LIBRARY', path: '../../' }];

    tabs: Tab[] = [
        { name: 'STRATEGY_EDIT', icon: 'anticon-edit', active: true },
        { name: 'SIMULATE_BACKTEST', icon: 'anticon-rocket', active: false }
    ];

    strategyName: Observable<string>;

    language: Observable<number>;

    category: Observable<number>;

    name$: Subject<string> = new Subject();

    language$: Subject<number> = new Subject();

    category$: Subject<number> = new Subject();

    selectedTemplates$: Subject<number[]> = new Subject();

    args$: Subject<StrategyMetaArg> = new Subject();

    args: Observable<StrategyMetaArg>;

    commandArgs$: Subject<StrategyMetaArg> = new Subject();

    commandArgs: Observable<StrategyMetaArg>;

    strategyId: number;

    strategy: Observable<StrategyDetail>;

    save$: Subject<boolean | CodeContent> = new Subject();

    save$$: Subscription;

    export$: Subject<FileContent> = new Subject();

    @ViewChild(StrategyCodemirrorComponent) codeMirror: StrategyCodemirrorComponent;

    @ViewChild(StrategyDesComponent) StrategyDes: StrategyDesComponent;

    @ViewChild('strategyArgs') strategyArgs: ArgListComponent;

    @ViewChild('strategyCommandArgs') strategyCommandArgs: ArgListComponent;


    constructor(
        public route: ActivatedRoute,
        public strategyService: StrategyOperateService,
        public nodeService: BtNodeService,
        public nzModal: NzModalService,
    ) { }

    initialModel() {
        const id = +this.route.snapshot.paramMap.get('id');

        this.strategyId = id;

        const target = this.strategyService.getStrategies()
            .pipe(mergeMap(list => from(list)), find(item => item.id === id));

        this.strategyName = target.pipe(map(item => item.name));

        this.language = target.pipe(map(item => item.language));

        this.category = target.pipe(map(item => item.category));

        this.strategy = this.strategyService.getStrategyDetail();

        /**
         *  FIXME: 直接订阅时subject时，无法传递相同的数据，map 函数中的值不使用扩展运算符时也一样，
         *  类似于distinct的效果，但是翻了下 async 的源码没有看到相关的设置，困惑！
         */
        this.args = this.args$.map(item => ({ ...item }));

        this.commandArgs = this.commandArgs$.map(item => ({ ...item }));

        this.args$.subscribe(v => console.log('args', v));

        this.commandArgs$.subscribe(v => console.log('command args', v));
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
                .add(this.export$.subscribe(content => this.exportFile(content)))
                // .add(this.strategyService.launchSaveStrategy(this.save$.mapTo({ code: this.codeMirror.codeContent, note: this.codeMirror.noteContent, des: this.codeMirror.desContent, manual: this.codeMirror.manualContent }).merge(this.code$).switchMap(code => this.getSaveStrategyParams(code))))
                .add(this.strategyService.launchStrategyDetail(id.map(id => ({ id }))))
                .add(this.strategyService.launchStrategyList(of({ offset: -1, limit: -1, strategyType: -1, categoryType: CategoryType.TEMPLATE_LIBRARY, needArgsType: needArgsType.onlyStrategyArg })))
                .add(this.nodeService.launchGetNodeList(of(true), true));
        }
    }

    ngAfterViewInit() {
        this.save$$ = this.strategyService.launchSaveStrategy(this.save$.map(content => isBoolean(content) ? { code: this.codeMirror.codeContent, note: this.codeMirror.noteContent, des: this.codeMirror.desContent, manual: this.codeMirror.manualContent } : content).switchMap(code => this.getSaveStrategyParams(code)))
    }

    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        return !this.codeMirror.isCodeChanged();
    }

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
}
