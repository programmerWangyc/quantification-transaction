import { from as observableFrom, of as observableOf, Observable, Subscription } from 'rxjs';
import { withLatestFrom, map, mergeMap, switchMap } from 'rxjs/operators';
import { RobotStatusTable } from '../robot.interface';
import { ServerSendRobotEventType } from '../robot.config';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { includes, isEmpty } from 'lodash';
import * as moment from 'moment';
import { ResetRobotDetailAction } from '../../store/robot/robot.action';
import * as fromReq from './../../interfaces/request.interface';
import * as fromRes from './../../interfaces/response.interface';
import { ErrorService } from './../../providers/error.service';
import { ProcessService } from './../../providers/process.service';
import { PublicService } from './../../providers/public.service';
import { TipService } from './../../providers/tip.service';
import * as fromRoot from './../../store/index.reducer';
import { ServerSendRobotMessage, RobotStatus } from './../../interfaces/response.interface';
import { NzModalService } from 'ng-zorro-antd';
import { CreateRobotComponent } from '../create-robot/create-robot.component';
import { TranslateService } from '@ngx-translate/core';
import { BtNodeService } from '../../providers/bt-node.service';
import { ConfirmComponent } from '../../tool/confirm/confirm.component';
import { OPERATE_ROBOT_LOADING_TAIL } from '../../store/robot/robot.reducer';

@Injectable()
export class RobotService {

    constructor(
        private store: Store<fromRoot.AppState>,
        private process: ProcessService,
        private error: ErrorService,
        private tipService: TipService,
        private pubService: PublicService,
        private nzModel: NzModalService,
        private translate: TranslateService,
        private nodeService: BtNodeService,
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

    launchCreateRobot(data: Observable<fromReq.SaveRobotRequest>): Subscription {
        return this.process.processSaveRobot(
            data.pipe(switchMap(data => this.nodeService.isPublicNode(data.nodeId).pipe(
                mergeMap(isPublic => isPublic ? this.tipService.confirmOperateTip(
                    ConfirmComponent,
                    { message: 'RECOMMENDED_USE_PRIVATE_NODE', needTranslate: true, confirmBtnText: 'GO_ON' }
                ).pipe(map(sure => sure ? data : null)) : observableOf(data)))))
                .filter(v => !!v)
        );
    }

    /* =======================================================Date Acquisition======================================================= */

    // robot list
    private getRobotListResponse(): Observable<fromRes.RobotListResponse> {
        return this.store.select(fromRoot.selectRobotListData)
            .filter(response => !!response)
    }

    getRobotTotal(): Observable<number> {
        return this.getRobotListResponse().pipe(
            map(res => res.all));
    }

    getRobotConcurrence(): Observable<number> {
        return this.getRobotListResponse().pipe(
            map(res => res.concurrent));
    }

    getRobots(): Observable<fromRes.Robot[]> {
        return this.getRobotListResponse().pipe(
            map(res => res.robots));
    }

    getRobotListResState(): Observable<fromRes.ResponseState> {
        return this.store.select(fromRoot.selectRobotListResState)
            .filter(res => !!res);
    }

    getRobotCountByStatus(predicate: (robot: fromRes.Robot) => boolean): Observable<fromRes.Robot[]> {
        return this.getRobots().pipe(
            map(robots => robots.filter(predicate)));
    }

    getRobotDeadLine(): Observable<string> {
        return this.getRobotCountByStatus(this.isNormalStatus).pipe(
            withLatestFrom(this.pubService.getBalance()),
            map(([robots, balance]) => {
                const now = parseInt(new Date().getTime() / 10000 + '') * 10000;

                const remain = robots.reduce((acc, cur) => acc + (cur.charge_time * 1000 - now), 0);

                const count = Math.max(1, robots.length);

                const remainTime = parseInt(remain + (balance / 1e8 / 0.125) * 3600000 / count + '');

                return moment(now + remainTime).format('YYYY-MM-DD HH:mm:ss');
            }), );
    }

    getGrossProfit(): Observable<number> {
        return this.getRobots().pipe(
            map(robots => robots.reduce((acc, cur) => acc + cur.profit, 0)));
    }

    // robot detail
    private getRobotDetailResponse(): Observable<fromRes.GetRobotDetailResponse> {
        return this.store.select(fromRoot.selectRobotDetailResponse)
            .filter(res => !!res);
    }

    getRobotDetail(): Observable<fromRes.RobotDetail> {
        return this.getRobotDetailResponse().pipe(
            map(res => res.result.robot));
    }

    getCurrentRobotId(): Observable<number> {
        return this.getRobotDetail().pipe(map(robot => robot.id));
    }

    getRobotStrategyExchangePair(): Observable<fromRes.StrategyExchangePairs> {
        return this.getRobotDetail().pipe(
            map(detail => {
                const [kLinePeriod, exchangeIds, stocks] = JSON.parse(detail.strategy_exchange_pairs);

                return { kLinePeriod, exchangeIds, stocks };
            }))
    }

    canChangePlatform(): Observable<boolean> {
        return this.getRobotStrategyExchangePair().pipe(
            map(pairs => pairs.exchangeIds.some(id => id > -10)))
            .do(canChange => !canChange && this.tipService.showTip('ROBOT_CREATED_BY_API_TIP'))
    }

    // subscribe robot
    private getSubscribeRobotResponse(): Observable<fromRes.SubscribeRobotResponse> {
        return this.store.select(fromRoot.selectSubscribeRobotResponse)
            .filter(res => !!res);
    }

    isSubscribeRobotSuccess(): Observable<boolean> {
        return this.getSubscribeRobotResponse().pipe(
            map(res => res.result));
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

                return observableFrom(ary).pipe(map(res => this.getSummary(res.trim()))).reduce((acc, cur) => [...acc, cur], []);
            });
    }

    /* =======================================================Short cart method================================================== */

    monitorServerSendRobotStatus(): Subscription {
        const param = this.getServerSendRobotMessage()
            .filter(data => data.status && this.isOverStatus(data))
            .switchMap(data => this.getRobotDetail().pipe(map(({ id }) => ({ id }))).filter(({ id }) => id === data.id));

        return this.launchRobotDetail(param);
    }

    isOverStatus(robot: fromRes.Robot | fromRes.ServerSendRobotMessage | fromRes.RobotDetail): boolean {
        return includes([RobotStatus.COMPLETE, RobotStatus.STOPPED, RobotStatus.ERROR], robot.status);
    }

    isNormalStatus(robot: fromRes.Robot | fromRes.ServerSendRobotMessage | fromRes.RobotDetail): boolean {
        return includes([RobotStatus.QUEUEING, RobotStatus.RUNNING, RobotStatus.STOPPING], robot.status);
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

    isLoading(type?: string): Observable<boolean> {
        return this.store.select(fromRoot.selectRobotUiState).pipe(map(state => type ? state[type] : state.loading));
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
