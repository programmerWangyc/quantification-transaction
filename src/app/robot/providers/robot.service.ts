import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { includes } from 'lodash';
import * as moment from 'moment';
import { Observable, of as observableOf, Subscription } from 'rxjs';
import { filter, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';

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
import { ConfirmComponent } from '../../tool/confirm/confirm.component';

@Injectable({
    providedIn: 'root',
})
export class RobotService extends BaseService {

    constructor(
        private store: Store<fromRoot.AppState>,
        private process: ProcessService,
        private error: ErrorService,
        private tipService: TipService,
        private pubService: PublicService,
        private nodeService: BtNodeService,
    ) {
        super();
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
                    mergeMap(isPublic => isPublic ? this.tipService.confirmOperateTip(ConfirmComponent, { message: 'RECOMMENDED_USE_PRIVATE_NODE', needTranslate: true, confirmBtnText: 'GO_ON' }).pipe(
                        map(sure => sure ? data : null)
                    ) : observableOf(data))
                )),
                this.filterTruth()
            )
        );
    }

    //  =======================================================Date Acquisition=======================================================

    // robot list
    /**
     * @ignore
     */
    private getRobotListResponse(): Observable<fromRes.RobotListResponse> {
        return this.store.select(fromRoot.selectRobotListData).pipe(
            this.filterTruth()
        );
    }

    /**
     * @ignore
     */
    getRobotTotal(): Observable<number> {
        return this.getRobotListResponse().pipe(
            map(res => res.all)
        );
    }

    /**
     * @ignore
     */
    getRobotConcurrence(): Observable<number> {
        return this.getRobotListResponse().pipe(
            map(res => res.concurrent)
        );
    }

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
    getRobotListResState(): Observable<fromRes.ResponseState> {
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
    private getPublicRobotListResponse(): Observable<fromRes.GetPublicRobotListResponse> {
        return this.store.pipe(
            select(fromRoot.selectPublicRobotListResponse),
            this.filterTruth()
        );
    }

    /**
     * @ignore
     */
    getPublicRobotTotal(): Observable<number> {
        return this.getPublicRobotListResponse().pipe(
            map(res => res.result.all)
        );
    }


    // robot detail
    /**
     * @ignore
     */
    private getRobotDetailResponse(): Observable<fromRes.GetRobotDetailResponse> {
        return this.store.select(fromRoot.selectRobotDetailResponse).pipe(
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
    getCurrentRobotId(): Observable<number> {
        return this.getRobotDetail().pipe(
            map(robot => robot.id)
        );
    }

    getRobotStrategyExchangePair(): Observable<fromRes.StrategyExchangePairs> {
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
    canChangePlatform(): Observable<boolean> {
        return this.getRobotStrategyExchangePair().pipe(
            map(pairs => pairs.exchangeIds.some(id => id > -10)),
            tap(canChange => !canChange && this.tipService.showTip('ROBOT_CREATED_BY_API_TIP'))
        );
    }

    // subscribe robot
    /**
     * @ignore
     */
    private getSubscribeRobotResponse(): Observable<fromRes.SubscribeRobotResponse> {
        return this.store.select(fromRoot.selectSubscribeRobotResponse).pipe(
            this.filterTruth()
        );
    }

    /**
     * @ignore
     */
    isSubscribeRobotSuccess(): Observable<boolean> {
        return this.getSubscribeRobotResponse().pipe(
            map(res => res.result)
        );
    }

    // server send message
    /**
     * @ignore
     */
    private getServerSendRobotMessage(): Observable<fromRes.ServerSendRobotMessage> {
        return this.store.select(fromRoot.selectServerSendRobotMessage).pipe(
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

    //  =======================================================Short cart method==================================================

    /**
     * @ignore
     */
    monitorServerSendRobotStatus(): Subscription {
        const param = this.getServerSendRobotMessage().pipe(
            filter(data => data.status && this.isOverStatus(data)),
            switchMap(data => this.getRobotDetail().pipe(
                map(({ id }) => ({ id })),
                filter(({ id }) => id === data.id)
            ))
        );

        return this.launchRobotDetail(param);
    }

    /**
     * 结束状态
     */
    isOverStatus(robot: fromRes.Robot | fromRes.ServerSendRobotMessage | fromRes.RobotDetail): boolean {
        return includes([fromRes.RobotStatus.COMPLETE, fromRes.RobotStatus.STOPPED, fromRes.RobotStatus.ERROR], robot.status);
    }

    /**
     * 正常状态
     */
    isNormalStatus(robot: fromRes.Robot | fromRes.ServerSendRobotMessage | fromRes.RobotDetail): boolean {
        return includes([fromRes.RobotStatus.QUEUEING, fromRes.RobotStatus.RUNNING, fromRes.RobotStatus.STOPPING], robot.status);
    }

    //  =======================================================Local state modify==================================================

    /**
     * 获取loading的状态；
     * @param type loading type
     */
    isLoading(type?: string): Observable<boolean> {
        return this.store.select(fromRoot.selectRobotUiState).pipe(
            map(state => type ? state[type] : state.loading)
        );
    }

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
}
