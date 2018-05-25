import 'rxjs/add/operator/skip';

import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { includes } from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { BaseComponent } from '../../base/base.component';
import { LogTypes, SemanticsLog } from '../../interfaces/constant.interface';
import { RunningLog } from '../../interfaces/response.interface';
import { PAGE_SIZE_SELECT_VALUES } from './../../providers/constant.service';
import { TipService } from './../../providers/tip.service';
import { RobotLogService } from './../providers/robot.log.service';
import { RobotService } from './../providers/robot.service';

interface FilterType {
    type: number;
    selected: boolean;
}

const filterTypes: FilterType[] = [
    { type: LogTypes.BUY, selected: true },
    { type: LogTypes.SALE, selected: true },
    { type: LogTypes.RETRACT, selected: true },
    { type: LogTypes.ERROR, selected: true },
    { type: LogTypes.PROFIT, selected: true },
    { type: LogTypes.MESSAGE, selected: true },
    { type: LogTypes.RESTART, selected: true },
];

const soundTypes: string[] = [
    LogTypes[0],
    LogTypes[1],
    LogTypes[2],
    LogTypes[3],
    LogTypes[4],
    LogTypes[5],
    LogTypes[6],
]

@Component({
    selector: 'app-robot-log',
    templateUrl: './robot-log.component.html',
    styleUrls: ['./robot-log.component.scss']
})
export class RobotLogComponent extends BaseComponent {

    @Input() allowSeparateRequest = true;

    subscription$$: Subscription;

    logs: Observable<RunningLog[]>;

    logTotal: Observable<number>;

    pageSize: Observable<number>

    pageSizeSelectorValues = PAGE_SIZE_SELECT_VALUES;

    statistics: Observable<string>;

    filterTypes = filterTypes;

    soundTypes = soundTypes;

    search$: Subject<FilterType[]> = new Subject();

    refresh$: Subject<boolean> = new Subject();

    isLoading: Observable<boolean>;

    isSoundOpen = false;

    // FIXME: ng-zorro框架的问题，只有string[]的才能赋值成功;
    monitoringSoundTypes: string[] = [...soundTypes];

    currentPage = 1;

    sync$$: Subscription;

    constructor(
        private robotService: RobotService,
        private activatedRoute: ActivatedRoute,
        private tipService: TipService,
        private robotLog: RobotLogService,
    ) {
        super();
    }

    ngOnInit() {
        this.initialModel();

        this.launch();

        this.updateMonitoringTypes(this.monitoringSoundTypes);

        this.updateSoundState(this.isSoundOpen);
    }

    initialModel() {
        this.logs = this.robotLog.getSemanticsRobotRunningLogs()
            .combineLatest(
                this.search$.startWith(this.filterTypes).map(types => types.filter(type => type.selected).map(item => item.type)),
                (logs, selectedTypes) => logs.filter(log => includes(selectedTypes, log.logType))
            )
            .startWith([]);

        this.logTotal = this.robotLog.getLogsTotal(SemanticsLog.runningLog);

        this.pageSize = this.robotLog.getRobotLogDefaultParams().map(params => params.logLimit).startWith(20);

        this.statistics = this.robotLog.getRobotLogPaginationStatistics();

        this.isLoading = this.robotService.isLoading();
    }

    launch() {
        const id = this.activatedRoute.paramMap.map(param => +param.get('id'));

        this.subscription$$ = this.robotLog.launchRobotLogs(id.map(robotId => ({ robotId })), this.allowSeparateRequest)
            .add(this.robotLog.launchRobotLogs(id.combineLatest(this.robotLog.getLogOffset(), (robotId, logOffset) => ({ robotId, logOffset })).skip(1)))
            // .add(this.robotLog.launchSyncLogsWhenServerRefreshed())
            .add(this.robotLog.launchRefreshRobotLogs(this.refresh$))
            .add(this.robotLog.needPlayTipAudio().filter(need => need).subscribe(_ => this.playAudio()))
            .add(this.robotLog.handleRobotLogsError())

        // FIXME: 这行加到上面时在组件销毁时没有取消掉, 然后每次进入时就会多出一条同步信息的流。why?
        this.sync$$ = this.robotLog.launchSyncLogsWhenServerRefreshed();
    }

    onPageSizeChange(size: number): void {
        // Seconde params comes from the reducer data structure ,indicates the path of the target data which would be changed.
        this.robotLog.modifyDefaultParam(size, ['robotLogs', 'logLimit']);
    }

    resetFilterTypes(): void {
        this.filterTypes.forEach(item => item.selected = true);

        this.search$.next(this.filterTypes);
    }

    updateMonitoringTypes(types: string[]): void {
        this.robotLog.updateMonitoringSoundTypes(types.map(item => LogTypes[item]));
    }

    playAudio() {
        const src = '../../../assets/audio/tip_1.mp3';

        this.tipService.playAudio(src);
    }

    updateSoundState(state: boolean) {
        this.robotLog.updateMonitorSoundState(state);
    }

    changePage(page) {
        this.robotLog.changeLogPage(page);
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();

        this.sync$$.unsubscribe();
    }

}
