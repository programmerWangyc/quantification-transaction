import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { includes } from 'lodash';
import * as moment from 'moment';
import { Observable, of as observableOf, Subscription } from 'rxjs';
import { filter, map, mapTo, mergeMap, switchMap, tap, withLatestFrom, takeWhile, take } from 'rxjs/operators';

import { BaseService } from '../../base/base.service';
import * as fromReq from '../../interfaces/request.interface';
import * as fromRes from '../../interfaces/response.interface';
import { BtNodeService } from '../../providers/bt-node.service';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import { PublicService } from '../../providers/public.service';
import { TipService } from '../../providers/tip.service';
import * as fromRoot from '../../store/index.reducer';
import { ResetRobotDetailAction, ResetRobotStateAction } from '../../store/robot/robot.action';
import { TranslateService } from '@ngx-translate/core';

export class RobotBaseService extends BaseService {

    constructor(
        public store: Store<fromRoot.AppState>,
        public tipService: TipService,
    ) {
        super();
    }

    /**
     * @ignore
     */
    protected getRobotDetailResponse(): Observable<fromRes.GetRobotDetailResponse> {
        return this.store.pipe(
            select(fromRoot.selectRobotDetailResponse),
            filter(this.isTruth)
        );
    }

    /**
     * @ignore
     */
    getRobotDetail(): Observable<fromRes.RobotDetail> {
        return this.getRobotDetailResponse().pipe(
            map(res => res.result.robot)
        );
    }

    /**
     * @ignore
     */
    protected getRobotStrategyExchangePair(): Observable<fromRes.StrategyExchangePairs> {
        return this.getRobotDetail().pipe(
            map(detail => {
                const [kLinePeriod, exchangeIds, stocks] = JSON.parse(detail.strategy_exchange_pairs);

                return { kLinePeriod, exchangeIds, stocks };
            })
        );
    }

    /**
     * @ignore
     */
    protected canChangePlatform(): Observable<boolean> {
        return this.getRobotStrategyExchangePair().pipe(
            map(pairs => pairs.exchangeIds.some(id => id > -10)),
            tap(canChange => !canChange && this.tipService.messageError('ROBOT_CREATED_BY_API_TIP'))
        );
    }
}

@Injectable({
    providedIn: 'root',
})
export class RobotService extends RobotBaseService {

    constructor(
        public store: Store<fromRoot.AppState>,
        private process: ProcessService,
        private error: ErrorService,
        public tipService: TipService,
        private pubService: PublicService,
        private nodeService: BtNodeService,
        private translate: TranslateService,
    ) {
        super(store, tipService);
    }

    //  =======================================================Serve Request=======================================================

    /**
     * @ignore
     */
    launchRobotList(data: Observable<fromReq.GetRobotListRequest>): Subscription {
        return this.process.processRobotList(data);
    }

    /**
     * @ignore
     */
    launchRobotDetail(data: Observable<fromReq.GetRobotDetailRequest>) {
        return this.process.processRobotDetail(data);
    }

    /**
     * @ignore
     */
    launchSubscribeRobot(data: Observable<fromReq.SubscribeRobotRequest>): Subscription {
        return this.process.processSubscribeRobot(data);
    }

    /**
     * @ignore
     */
    launchCreateRobot(source: Observable<fromReq.SaveRobotRequest>): Subscription {
        return this.process.processSaveRobot(
            source.pipe(
                switchMap(data => this.nodeService.isPublicNode(data.nodeId).pipe(
                    mergeMap(isPublic => isPublic ? this.tipService.guardRiskOperate('RECOMMENDED_USE_PRIVATE_NODE', {}, { nzOkText: this.unwrap(this.translate.get('GO_ON')) }).pipe(
                        mapTo(data)
                    ) : observableOf(data))
                ))
            )
        );
    }

    //  =======================================================Date Acquisition=======================================================

    // robot list
    /**
     * @ignore
     */
    private getRobotListResponse(): Observable<fromRes.RobotListResponse> {
        return this.store.pipe(
            select(fromRoot.selectRobotListData),
            this.filterTruth()
        );
    }

    /**
     * @ignore
     */
    // private getRobotTotal(): Observable<number> {
    //     return this.getRobotListResponse().pipe(
    //         map(res => res.all)
    //     );
    // }

    /**
     * @ignore
     */
    // private getRobotConcurrence(): Observable<number> {
    //     return this.getRobotListResponse().pipe(
    //         map(res => res.concurrent)
    //     );
    // }

    /**
     * @ignore
     */
    getRobots(): Observable<fromRes.Robot[]> {
        return this.getRobotListResponse().pipe(
            map(res => res.robots)
        );
    }

    /**
     * @ignore
     */
    private getRobotListResState(): Observable<fromRes.ResponseState> {
        return this.store.pipe(
            select(fromRoot.selectRobotListResState),
            this.filterTruth()
        );
    }

    getRobotCountByStatus(predicate: (robot: fromRes.Robot) => boolean): Observable<fromRes.Robot[]> {
        return this.getRobots().pipe(
            map(robots => robots.filter(predicate))
        );
    }

    getRobotDeadLine(): Observable<string> {
        return this.getRobotCountByStatus(this.isNormalStatus).pipe(
            withLatestFrom(this.pubService.getBalance()),
            map(([robots, balance]) => {
                const now = parseInt(new Date().getTime() / 10000 + '', 10) * 10000;

                const remain = robots.reduce((acc, cur) => acc + (cur.charge_time * 1000 - now), 0);

                const count = Math.max(1, robots.length);

                const remainTime = parseInt(remain + (balance / 1e8 / 0.125) * 3600000 / count + '', 10);

                return moment(now + remainTime).format('YYYY-MM-DD HH:mm:ss');
            })
        );
    }

    /**
     * 总收益
     */
    getGrossProfit(): Observable<number> {
        return this.getRobots().pipe(
            map(robots => robots.reduce((acc, cur) => acc + cur.profit, 0))
        );
    }

    // public robot list
    /**
     * @ignore
     */
    // private getPublicRobotListResponse(): Observable<fromRes.GetPublicRobotListResponse> {
    //     return this.store.pipe(
    //         select(fromRoot.selectPublicRobotListResponse),
    //         this.filterTruth()
    //     );
    // }

    /**
     * @ignore
     */
    // private getPublicRobotTotal(): Observable<number> {
    //     return this.getPublicRobotListResponse().pipe(
    //         map(res => res.result.all)
    //     );
    // }

    /**
     * @ignore
     */
    getCurrentRobotId(): Observable<number> {
        return this.getRobotDetail().pipe(
            map(robot => robot.id)
        );
    }

    // subscribe robot
    /**
     * @ignore
     */
    private getSubscribeRobotResponse(): Observable<fromRes.SubscribeRobotResponse> {
        return this.store.pipe(
            select(fromRoot.selectSubscribeRobotResponse),
            this.filterTruth()
        );
    }

    /**
     * @ignore
     */
    // isSubscribeRobotSuccess(): Observable<boolean> {
    //     return this.getSubscribeRobotResponse().pipe(
    //         map(res => res.result)
    //     );
    // }

    // server send message
    /**
     * @ignore
     */
    private getServerSendRobotMessage(): Observable<fromRes.ServerSendRobotMessage> {
        return this.store.pipe(
            select(fromRoot.selectServerSendRobotMessage),
            filter(this.isTruth)
        );
    }

    /**
     * @ignore
     */
    getServerSendRobotMessageType(msgType: number): Observable<fromRes.ServerSendRobotMessage> {
        return this.getServerSendRobotMessage().pipe(
            filter(msg => !!(msg.flags & msgType))
        );
    }

    private getSaveRobotResponse(): Observable<fromRes.SaveRobotResponse> {
        return this.store.pipe(
            select(fromRoot.selectSaveRobotResponse),
            this.filterTruth()
        );
    }

    //  =======================================================Short cart method==================================================

    /**
     * @ignore
     */
    monitorServerSendRobotStatus(): Subscription {
        const param = this.getServerSendRobotMessage().pipe(
            filter(data => data.status && this.isOverStatus(data)),
            switchMap(data => this.getRobotDetail().pipe(
                take(1),
                map(({ id }) => ({ id })),
                filter(({ id }) => id === data.id),
            ))
        );

        return this.launchRobotDetail(param);
    }

    /**
     * 结束状态
     */
    private isOverStatus(robot: fromRes.Robot | fromRes.ServerSendRobotMessage | fromRes.RobotDetail): boolean {
        return includes([fromRes.RobotStatus.COMPLETE, fromRes.RobotStatus.STOPPED, fromRes.RobotStatus.ERROR], robot.status);
    }

    /**
     * 正常状态
     */
    isNormalStatus(robot: fromRes.Robot | fromRes.ServerSendRobotMessage | fromRes.RobotDetail): boolean {
        return includes([fromRes.RobotStatus.QUEUEING, fromRes.RobotStatus.RUNNING, fromRes.RobotStatus.STOPPING], robot.status);
    }

    /**
     * 获取loading的状态；
     * @param type loading type
     */
    isLoading(type?: string): Observable<boolean> {
        return this.store.pipe(
            select(fromRoot.selectRobotUiState),
            map(state => type ? state[type] : state.loading),
            this.loadingTimeout(value => this.tipService.loadingSlowlyTip(value))
        );
    }

    //  =======================================================Local state modify==================================================

    /**
     * @ignore
     */
    resetRobotDetail(): void {
        this.store.dispatch(new ResetRobotDetailAction());
    }

    /**
     * @ignore
     */
    resetRobotState(): void {
        this.store.dispatch(new ResetRobotStateAction());
    }

    //  =======================================================Error Handle=======================================================

    /**
     * @ignore
     */
    handleRobotListError(): Subscription {
        return this.error.handleResponseError(this.getRobotListResState());
    }

    /**
     * @ignore
     */
    handleRobotDetailError(): Subscription {
        return this.error.handleResponseError(this.getRobotDetailResponse());
    }

    /**
     * @ignore
     */
    handleSubscribeRobotError(): Subscription {
        return this.error.handleResponseError(this.getSubscribeRobotResponse());
    }

    /**
     * @ignore
     */
    handleSaveRobotError(keepAlive: () => boolean): Subscription {
        return this.error.handleResponseError(this.getSaveRobotResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
}
