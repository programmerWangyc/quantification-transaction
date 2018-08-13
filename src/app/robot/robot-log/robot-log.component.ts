import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { includes } from 'lodash';
import { combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { filter, map, skip, startWith } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { RunningLog } from '../../interfaces/response.interface';
import { PAGE_SIZE_SELECT_VALUES } from '../../providers/constant.service';
import { TipService } from '../../providers/tip.service';
import { UtilService } from '../../providers/util.service';
import { LogTypes } from '../../tool/tool.config';
import { RobotLogService } from '../providers/robot.log.service';
import { RobotService } from '../providers/robot.service';
import { SemanticsLog } from '../robot.config';

const soundTypes: string[] = [
    LogTypes[0],
    LogTypes[1],
    LogTypes[2],
    LogTypes[3],
    LogTypes[4],
    LogTypes[5],
    LogTypes[6],
];

@Component({
    selector: 'app-robot-log',
    templateUrl: './robot-log.component.html',
    styleUrls: ['./robot-log.component.scss'],
})
export class RobotLogComponent extends BaseComponent {

    /**
     * @ignore
     */
    subscription$$: Subscription;

    /**
     * Running logs;
     */
    logs: Observable<RunningLog[]>;

    /**
     * @ignore
     */
    logTotal: Observable<number>;

    /**
     * @ignore
     */
    pageSize: Observable<number>;

    /**
     * @ignore
     */
    pageSizeSelectorValues = PAGE_SIZE_SELECT_VALUES;

    /**
     * Statistics label
     */
    statistics: Observable<string>;

    /**
     * @ignore
     */
    soundTypes = soundTypes;

    /**
     * 选择过滤的日志类型
     */
    search$: Subject<number[]> = new Subject();

    /**
     * @ignore
     */
    refresh$: Subject<boolean> = new Subject();

    /**
     * @ignore
     */
    isLoading: Observable<boolean>;

    /**
     * @ignore
     */
    isSoundOpen = false;

    /**
     * !FIXME: ng-zorro框架的问题，只有string[]的才能赋值成功;
     * @ignore
     */
    monitoringSoundTypes: string[] = [...soundTypes];

    /**
     * @ignore
     */
    currentPage = 1;

    /**
     * @ignore
     */
    sync$$: Subscription;

    constructor(
        private robotService: RobotService,
        private activatedRoute: ActivatedRoute,
        private tipService: TipService,
        private robotLog: RobotLogService,
        private utilService: UtilService,
    ) {
        super();
    }

    /**
     * @ignore
     */
    ngOnInit() {
        this.initialModel();

        this.launch();

        this.updateMonitoringTypes(this.monitoringSoundTypes);

        this.updateSoundState(this.isSoundOpen);
    }

    /**
     * @ignore
     */
    initialModel() {
        this.logs = combineLatest(
            this.robotLog.getSemanticsRobotRunningLogs(),
            this.search$
        ).pipe(
            map(([logs, selectedTypes]) => selectedTypes.length ? logs.filter(log => includes(selectedTypes, log.logType)) : logs),
            startWith([])
        );

        this.logTotal = this.robotLog.getLogsTotal(SemanticsLog.runningLog);

        this.pageSize = this.robotLog.getRobotLogDefaultParams().pipe(
            map(params => params.logLimit),
            startWith(20)
        );

        this.statistics = this.utilService.getPaginationStatistics(this.logTotal, this.pageSize);

        this.isLoading = this.robotService.isLoading('logsLoading');
    }

    /**
     * @ignore
     */
    launch() {
        const id = this.activatedRoute.paramMap.pipe(map(param => +param.get('id')));

        this.subscription$$ = this.robotLog.launchRobotLogs(id.pipe(
            map(robotId => ({ robotId }))
        ))
            .add(this.robotLog.launchRobotLogs(
                combineLatest(
                    id,
                    this.robotLog.getLogOffset()
                ).pipe(
                    map(([robotId, logOffset]) => ({ robotId, logOffset })),
                    skip(1)
                )
            )
            )
            // .add(this.robotLog.launchSyncLogsWhenServerRefreshed())
            .add(this.robotLog.launchRefreshRobotLogs(this.refresh$))
            .add(this.robotLog.needPlayTipAudio()
                .pipe(
                    filter(need => need)
                )
                .subscribe(_ => this.playAudio())
            )
            .add(this.robotLog.handleRobotLogsError());

        // !FIXME: 这行加到上面时在组件销毁时没有取消掉, 然后每次进入时就会多出一条同步信息的流。why?
        this.sync$$ = this.robotLog.launchSyncLogsWhenServerRefreshed();
    }

    /**
     * Modify params state in store;
     * @param size Page size;
     */
    onPageSizeChange(size: number): void {
        // Second params comes from the reducer data structure ,indicates the path of the target data which would be changed.
        this.robotLog.modifyDefaultParam(size, ['robotLogs', 'logLimit']);
    }

    /**
     * Update monitor type to store;
     */
    updateMonitoringTypes(types: string[]): void {
        this.robotLog.updateMonitoringSoundTypes(types.map(item => LogTypes[item]));
    }

    /**
     * @ignore
     */
    playAudio() {
        const src = '../../../assets/audio/tip_1.mp3';

        this.tipService.playAudio(src);
    }

    /**
     * Toggle sound state
     * @param state Open or close;
     */
    updateSoundState(state: boolean) {
        this.robotLog.updateMonitorSoundState(state);
    }

    /**
     * @ignore
     */
    changePage(page) {
        this.robotLog.changeLogPage(page);
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.subscription$$.unsubscribe();

        this.sync$$.unsubscribe();
    }

}
