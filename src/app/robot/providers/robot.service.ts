import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { includes } from 'lodash';
import * as moment from 'moment';
import { Observable, of as observableOf, Subscription } from 'rxjs';
import { filter, map, mapTo, mergeMap, switchMap, take, takeWhile, tap, withLatestFrom } from 'rxjs/operators';

import { BaseService } from '../../base/base.service';
import { keepAliveFn } from '../../interfaces/app.interface';
import * as fromReq from '../../interfaces/request.interface';
import * as fromRes from '../../interfaces/response.interface';
import { BtNodeService } from '../../providers/bt-node.service';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import { PublicService } from '../../providers/public.service';
import { TipService } from '../../providers/tip.service';
import * as fromRoot from '../../store/index.reducer';
import { ResetRobotDetailAction, ResetRobotStateAction } from '../../store/robot/robot.action';
import { isSaveRobotFail } from '../../store/robot/robot.effect';

export class RobotBaseService extends BaseService {

    constructor(
        public store: Store<fromRoot.AppState>,
        public tipService: TipService,
    ) {
        super();
    }

    protected getRobotDetailResponse(): Observable<fromRes.GetRobotDetailResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectRobotDetailResponse)
        );
    }

    getRobotDetail(): Observable<fromRes.RobotDetail> {
        return this.getRobotDetailResponse().pipe(
            map(res => res.result.robot)
        );
    }

    protected getRobotStrategyExchangePair(): Observable<fromRes.StrategyExchangePairs> {
        return this.getRobotDetail().pipe(
            map(detail => {
                const [kLinePeriod, exchangeIds, stocks] = JSON.parse(detail.strategy_exchange_pairs);

                return { kLinePeriod, exchangeIds, stocks };
            })
        );
    }

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

    launchRobotList(data: Observable<fromReq.GetRobotListRequest>): Subscription {
        return this.process.processRobotList(data);
    }

    launchRobotDetail(data: Observable<fromReq.GetRobotDetailRequest>) {
        return this.process.processRobotDetail(data);
    }

    launchSubscribeRobot(data: Observable<fromReq.SubscribeRobotRequest>): Subscription {
        return this.process.processSubscribeRobot(data);
    }

    launchCreateRobot(source: Observable<fromReq.SaveRobotRequest>): Subscription {
        return this.process.processSaveRobot(
            source.pipe(
                switchMap(data => this.nodeService.isPublicNode(data.nodeId).pipe(
                    take(1),
                    mergeMap(isPublic => isPublic ? this.tipService.guardRiskOperate('RECOMMENDED_USE_PRIVATE_NODE', {}, { nzOkText: this.unwrap(this.translate.get('GO_ON')) }).pipe(
                        mapTo(data)
                    ) : observableOf(data))
                ))
            )
        );
    }

    private getRobotListResponse(): Observable<fromRes.RobotListResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectRobotListData)
        );
    }

    getRobots(): Observable<fromRes.Robot[]> {
        return this.getRobotListResponse().pipe(
            map(res => res.robots)
        );
    }

    private getRobotListResState(): Observable<fromRes.ResponseState> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectRobotListResState)
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

    getGrossProfit(): Observable<number> {
        return this.getRobots().pipe(
            map(robots => robots.reduce((acc, cur) => acc + cur.profit, 0))
        );
    }
    getCurrentRobotId(): Observable<number> {
        return this.getRobotDetail().pipe(
            map(robot => robot.id)
        );
    }

    private getSubscribeRobotResponse(): Observable<fromRes.SubscribeRobotResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectSubscribeRobotResponse)
        );
    }

    private getServerSendRobotMessage(): Observable<fromRes.ServerSendRobotMessage> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectServerSendRobotMessage)
        );
    }

    getServerSendRobotMessageType(msgType: number): Observable<fromRes.ServerSendRobotMessage> {
        return this.getServerSendRobotMessage().pipe(
            filter(msg => !!(msg.flags & msgType))
        );
    }

    private getSaveRobotResponse(): Observable<fromRes.SaveRobotResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectSaveRobotResponse)
        );
    }

    isSaveRobotSuccess(): Observable<boolean> {
        return this.getSaveRobotResponse().pipe(
            map(res => !isSaveRobotFail(res))
        );
    }

    monitorServerSendRobotStatus(keepAlive: keepAliveFn): Subscription {
        const param = this.getServerSendRobotMessage().pipe(
            filter(data => data.status && this.isOverStatus(data)),
            switchMap(data => this.getRobotDetail().pipe(
                take(1),
                map(({ id }) => ({ id })),
                filter(({ id }) => id === data.id),
            )),
            takeWhile(keepAlive)
        );

        return this.launchRobotDetail(param);
    }

    private isOverStatus(robot: fromRes.Robot | fromRes.ServerSendRobotMessage | fromRes.RobotDetail): boolean {
        return includes([fromRes.RobotStatus.COMPLETE, fromRes.RobotStatus.STOPPED, fromRes.RobotStatus.ERROR], robot.status);
    }

    isNormalStatus(robot: fromRes.Robot | fromRes.ServerSendRobotMessage | fromRes.RobotDetail): boolean {
        return includes([fromRes.RobotStatus.QUEUEING, fromRes.RobotStatus.RUNNING, fromRes.RobotStatus.STOPPING], robot.status);
    }

    isLoading(type?: string): Observable<boolean> {
        return this.store.pipe(
            select(fromRoot.selectRobotUiState),
            map(state => type ? state[type] : state.loading),
            this.loadingTimeout(value => this.tipService.loadingSlowlyTip(value))
        );
    }

    resetRobotDetail(): void {
        this.store.dispatch(new ResetRobotDetailAction());
    }

    resetRobotState(): void {
        this.store.dispatch(new ResetRobotStateAction());
    }

    handleRobotListError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getRobotListResState().pipe(
            takeWhile(keepAlive)
        ));
    }

    handleRobotDetailError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getRobotDetailResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    handleSubscribeRobotError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getSubscribeRobotResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    handleSaveRobotError(keepAlive: () => boolean): Subscription {
        return this.error.handleResponseError(this.getSaveRobotResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
}
