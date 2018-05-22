import { ServerSendRobotEventType, RobotStatusTable } from './../../interfaces/constant.interface';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/delayWhen';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/switchMapTo';
import 'rxjs/add/operator/withLatestFrom';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { includes, isEmpty } from 'lodash';

import { ResetRobotDetailAction } from '../../store/robot/robot.action';
import * as fromReq from './../../interfaces/request.interface';
import * as fromRes from './../../interfaces/response.interface';
import { ErrorService } from './../../providers/error.service';
import { ProcessService } from './../../providers/process.service';
import { PublicService } from './../../providers/public.service';
import { TipService } from './../../providers/tip.service';
import * as fromRoot from './../../store/index.reducer';
import { ServerSendRobotMessage, RobotStatus } from './../../interfaces/response.interface';

@Injectable()
export class RobotService {

    constructor(
        private store: Store<fromRoot.AppState>,
        private process: ProcessService,
        private error: ErrorService,
        private tipService: TipService,
        private pubService: PublicService,
    ) {
    }

    /* =======================================================Serve Request======================================================= */

    launchRobotList(data: Observable<fromReq.GetRobotListRequest>): Subscription {
        return this.process.processRobotList(data);
    }

    launchRobotDetail(data: Observable<fromReq.GetRobotDetailRequest>) {
        return this.process.processRobotDetail(data);
    }

    launchSubscribeRobot(data: Observable<fromReq.SubscribeRobotRequest>, allowSeparateRequest = true): Subscription {
        return this.process.processSubscribeRobot(data, allowSeparateRequest);
    }

    /* =======================================================Date Acquisition======================================================= */

    // robot list
    private getRobotListResponse(): Observable<fromRes.RobotListResponse> {
        return this.store.select(fromRoot.selectRobotListData)
            .filter(response => !!response)
    }

    getRobotTotal(): Observable<number> {
        return this.getRobotListResponse()
            .map(res => res.all);
    }

    getRobotConcurrence(): Observable<number> {
        return this.getRobotListResponse()
            .map(res => res.concurrent);
    }

    getRobots(): Observable<fromRes.Robot[]> {
        return this.getRobotListResponse()
            .map(res => res.robots);
    }

    getRobotListResState(): Observable<fromRes.ResponseState> {
        return this.store.select(fromRoot.selectRobotListResState)
            .filter(res => !!res);
    }

    // robot detail
    private getRobotDetailResponse(): Observable<fromRes.GetRobotDetailResponse> {
        return this.store.select(fromRoot.selectRobotDetailResponse)
            .filter(res => !!res);
    }

    getRobotDetail(): Observable<fromRes.RobotDetail> {
        return this.getRobotDetailResponse()
            .map(res => res.result.robot);
    }

    getCurrentRobotId(): Observable<number> {
        return this.getRobotDetail().map(robot => robot.id);
    }

    getRobotStrategyExchangePair(): Observable<fromRes.StrategyExchangePairs> {
        return this.getRobotDetail()
            .map(detail => {
                const [kLinePeriod, exchangeIds, stocks] = JSON.parse(detail.strategy_exchange_pairs);

                return { kLinePeriod, exchangeIds, stocks };
            })
    }

    canChangePlatform(): Observable<boolean> {
        return this.getRobotStrategyExchangePair()
            .map(pairs => pairs.exchangeIds.some(id => id > -10))
            .do(canChange => !canChange && this.tipService.showTip('ROBOT_CREATED_BY_API_TIP'))
    }

    // subscribe robot
    private getSubscribeRobotResponse(): Observable<fromRes.SubscribeRobotResponse> {
        return this.store.select(fromRoot.selectSubscribeRobotResponse)
            .filter(res => !!res);
    }

    isSubscribeRobotSuccess(): Observable<boolean> {
        return this.getSubscribeRobotResponse()
            .map(res => res.result);
    }

    // server send message
    private getServerSendRobotMessage(): Observable<fromRes.ServerSendRobotMessage> {
        return this.store.select(fromRoot.selectServerSendRobotMessage)
            .filter(v => !!v);
    }

    getServerSendRobotMessageType(msgType: number): Observable<fromRes.ServerSendRobotMessage> {
        return this.getServerSendRobotMessage()
            .filter(msg => !!(msg.flags & msgType));
    }

    getRobotSummary(summary: Observable<string>): Observable<any[]> {
        return summary
            .filter(summary => !isEmpty(summary))
            .mergeMap(summary => {
                const ary = summary.split('\n');

                return Observable.from(ary).map(res => this.getSummary(res.trim())).reduce((acc, cur) => [...acc, cur], []);
            });
    }

    /* =======================================================Short cart method================================================== */

    monitorServerSendRobotStatus(): Subscription {
        const param = this.getServerSendRobotMessage()
            .filter(data => data.status && this.isOverStatus(data.status))
            .switchMap(data => this.getRobotDetail().map(({ id }) => ({ id })).filter(({ id }) => id === data.id));

        return this.launchRobotDetail(param);
    }

    isOverStatus(status: number): boolean {
        return includes([RobotStatus.COMPLETE, RobotStatus.STOPPED, RobotStatus.ERROR], status);
    }

    isNormalStatus(status: number): boolean {
        return includes([RobotStatus.QUEUEING, RobotStatus.RUNNING, RobotStatus.STOPPING], status);
    }

    private getSummary(source: string): any {
        const regRes = /^`(.*)`$/.exec(source);

        if (!regRes) return source;

        const [_, content] = regRes;

        const reg = /^\[.+\]$|^\{.+\}$/;

        if (reg.test(content)) {
            try {
                const res = JSON.parse(content);

                return res;
            } catch (e) {
                return e.toString();
            }
        } else {
            return content;
        }
    }

    /* =======================================================Local state modify================================================== */

    isLoading(): Observable<boolean> {
        return this.store.select(fromRoot.selectRobotUiState).map(state => state.isLoading);
    }

    resetRobotDetail(): void {
        this.store.dispatch(new ResetRobotDetailAction());
    }

    /* =======================================================Error Handle======================================================= */

    handleRobotListError(): Subscription {
        return this.error.handleResponseError(this.getRobotListResState());
    }

    handleRobotDetailError(): Subscription {
        return this.error.handleResponseError(this.getRobotDetailResponse());
    }

    handleSubscribeRobotError(): Subscription {
        return this.error.handleResponseError(this.getSubscribeRobotResponse());
    }
}
