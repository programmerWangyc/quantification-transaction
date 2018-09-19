import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { includes } from 'lodash';
import { combineLatest, Observable, Subject } from 'rxjs';
import { filter, map, startWith, takeWhile } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { RunningLog } from '../../interfaces/response.interface';
import { PAGE_SIZE_SELECT_VALUES } from '../../providers/constant.service';
import { RobotLogService } from '../../providers/robot.log.service';
import { TipService } from '../../providers/tip.service';
import { UtilService } from '../../providers/util.service';
import { LogTypes, SemanticsLog } from '../../tool/tool.config';

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

    isAlive = true;

    constructor(
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

        this.isLoading = this.robotLog.isLoading('logsLoading');
    }

    /**
     * @ignore
     */
    launch() {
        const id = this.activatedRoute.paramMap.pipe(map(param => +param.get('id')));

        const keepAlive = () => this.isAlive;

        this.robotLog.launchRobotLogs(
            combineLatest(
                id,
                this.robotLog.getLogPaginationInfo(),
            ).pipe(
                map(([robotId, pagination]) => ({ robotId, ...pagination })),
                takeWhile(keepAlive)
            )
        );

        this.robotLog.needPlayTipAudio().pipe(
            filter(need => need),
            takeWhile(keepAlive)
        ).subscribe(_ => this.playAudio());

        this.robotLog.handleRobotLogsError(keepAlive);

        this.robotLog.launchRefreshRobotLogs(this.refresh$.asObservable().pipe(
            takeWhile(keepAlive)
        ));

        this.robotLog.launchSyncLogsWhenServerRefreshed(keepAlive);
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
        this.isAlive = false;
    }

}
