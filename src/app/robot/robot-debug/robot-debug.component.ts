import { Component } from '@angular/core';

import { includes } from 'lodash';
import { combineLatest, concat, Observable, of, Subject, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { Breadcrumb } from '../../interfaces/app.interface';
import { BtNode, Platform, RunningLog } from '../../interfaces/response.interface';
import { BtNodeService } from '../../providers/bt-node.service';
import { PlatformService } from '../../providers/platform.service';
import { UtilService } from '../../providers/util.service';
import { RobotLogService } from '../../providers/robot.log.service';
import { RobotDebugFormModal, RobotOperateService } from '../../robot/providers/robot.operate.service';
import { RobotOperateType } from '../../store/robot/robot.reducer';

@Component({
    selector: 'app-robot-debug',
    templateUrl: './robot-debug.component.html',
    styleUrls: ['./robot-debug.component.scss'],
})
export class RobotDebugComponent implements BaseComponent {
    subscription$$: Subscription;

    paths: Breadcrumb[] = [{ name: 'CONTROL_CENTER' }, { name: 'ROBOT', path: '../' }, { name: 'DEBUG' }];

    platforms: Observable<Platform[]>;

    agents: Observable<BtNode[]>;

    hasAgents: Observable<boolean>;

    content = 'function main() {\n    exchange.SetTimeout(2000);\n    Log(exchange.GetCurrency(), "USDCNY:", exchange.GetUSDCNY());\n    return exchange.GetTicker();\n}';

    editorOptions = {
        lineNumbers: true,
        theme: 'eclipse',
        insertSoftTab: true,
        indentUnit: 4,
        styleActiveLine: true,
        gutters: ['CodeMirror-lint-markers'],
        lint: {
            '-W041': false,
            latedef: true,
            lastsemic: true,
            loopfunc: true,
            asi: true,
        },
        showHint: true,
        matchBrackets: true,
        mode: 'javascript',
    };

    debug$: Subject<RobotDebugFormModal> = new Subject();

    logs: Observable<RunningLog[]>;

    statistics: Observable<string>;

    logTotal: Observable<number>;

    pageSize: Observable<number>;

    pageSize$: Subject<number> = new Subject();

    initialPageSize = 20;

    filter$: Subject<number[]> = new Subject();

    debugResult: Observable<any>;

    isDebugging: Observable<boolean>;

    constructor(
        private nodeService: BtNodeService,
        private platformService: PlatformService,
        private robotOperate: RobotOperateService,
        private robotLog: RobotLogService,
        private utilService: UtilService,
    ) { }

    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    initialModel() {
        this.platforms = this.platformService.getPlatformList();

        this.agents = this.nodeService.getSpecificNodeList(this.nodeService.isLatestFunctionalNode, this.nodeService.isMineNode);

        this.hasAgents = this.agents.pipe(map(agents => !!agents.length));

        this.logs = combineLatest(
            this.robotOperate.getPluginRunLogs()
                .pipe(
                    map(res => res.map((item, idx) => this.robotLog.transformDebugLogToRunningLog(item, idx)))
                ),
            this.filter$
        )
            .pipe(
                map(([logs, selectedTypes]) => selectedTypes.length ? logs.filter(log => includes(selectedTypes, log.logType)) : logs),
                startWith([])
            );

        this.pageSize = of(this.initialPageSize);

        this.logTotal = this.logs.pipe(map(logs => logs.length));

        this.statistics = this.utilService.getPaginationStatistics(
            this.logTotal,
            concat(
                this.pageSize,
                this.pageSize$
            )
        );

        this.debugResult = this.robotOperate.getPluginRunResult();

        this.isDebugging = this.robotOperate.isLoading(RobotOperateType.debug);
    }

    launch() {
        this.subscription$$ = this.robotOperate.launchDebugRobot(this.debug$
            .pipe(
                map(options => ({ options, content: this.content }))
            )
        )
            .add(this.platformService.handlePlatformListError())
            .add(this.nodeService.handleNodeListError())
            .add(this.nodeService.launchGetNodeList(of(null)))
            .add(this.platformService.launchGetPlatformList(of(null)));
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }
}
