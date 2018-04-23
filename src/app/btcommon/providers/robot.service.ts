import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/switchMapTo';
import 'rxjs/add/operator/withLatestFrom';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { getRobotOperateMap } from '../../interfaces/constant.interface';
import { AuthService } from '../../shared/providers/auth.service';
import { ResetRobotDetailAction } from '../../store/robot/robot.action';
import { ConfirmComponent } from '../../tool/confirm/confirm.component';
import { VerifyPasswordComponent } from '../../tool/verify-password/verify-password.component';
import * as fromReq from './../../interfaces/request.interface';
import * as fromRes from './../../interfaces/response.interface';
import { BtNodeService } from './../../providers/bt-node.service';
import { ErrorService } from './../../providers/error.service';
import { ProcessService } from './../../providers/process.service';
import { PublicService } from './../../providers/public.service';
import { TipService } from './../../providers/tip.service';
import * as fromRoot from './../../store/index.reducer';

@Injectable()
export class RobotService {

    constructor(
        private store: Store<fromRoot.AppState>,
        private process: ProcessService,
        private error: ErrorService,
        private tipService: TipService,
        private pubService: PublicService,
        private btNodeService: BtNodeService,
        private authService: AuthService,
    ) {
    }

    /* =======================================================Serve Request======================================================= */

    launchRobotList(data: Observable<fromReq.GetRobotListRequest>): Subscription {
        return this.process.processRobotList(data);
    }

    launchPublicRobot(data: Observable<fromRes.Robot>): Subscription {
        return this.process.processPublicRobot(this.getPublicRobotRequest(data));
    }

    /**
     * FIXME:switch组件在点击动作发生后立即进行了状态切换，所以需要在检查用户确认状态后再次检查开关的状态，如果用户放弃切换动作需要把
     * 开关的状态切换回去。开关状态能否变更实际要等到服务器响应后，所以在接收到响应时还需要再次检查。
     */
    private getPublicRobotRequest(robot: Observable<fromRes.Robot>): Observable<fromReq.PublicRobotRequest> {
        return robot.switchMap(robot => this.tipService.confirmOperateTip(
            ConfirmComponent,
            robot.public ? 'PUBLISH_ROBOT_CONFIRM' : 'CANCEL_PUBLISH_ROBOT_CONFIRM',
        )
            .do(sure => !sure && (robot.public = Number(!robot.public)))
            .filter(sure => !!sure)
            .mapTo({ id: robot.id, type: Number(robot.public) })
        );
    }

    launchRobotDetail(data: Observable<fromReq.GetRobotDetailRequest>) {
        return this.process.processRobotDetail(data);
    }

    launchSubscribeRobot(data: Observable<fromReq.SubscribeRobotRequest>): Subscription {
        return this.process.processSubscribeRobot(data);
    }

    launchRobotLogs(data: Observable<fromReq.GetRobotLogsRequest>): Subscription {
        return this.process.processRobotLogs(data);
    }

    private getRobotOperateConfirm(robot: Observable<fromRes.RobotDetail>): Observable<boolean> {
        return robot.switchMap(robot => this.tipService.confirmOperateTip(
            ConfirmComponent,
            getRobotOperateMap(robot.status).tip
        ));
    }

    /**
     * @description 1、验证能否切换平台；2、提示用户进行操作确认；3、如果公有节点需要验证密码；
     */
    launchRestartRobot(data: Observable<fromRes.RobotDetail>): Subscription {
        const params = this.canChangePlatform()
            .filter(sure => sure)
            .mergeMapTo(this.getRobotOperateConfirm(data).filter(sure => sure).mergeMapTo(this.isPublicNode()))
            .switchMap(isPublic => isPublic ? this.isSecurityVerifySuccess() : Observable.of(true))
            .zip(data, (condition, data) => condition && data)
            .filter(value => !!value)
            .map(({ id }) => ({ id }));

        return this.process.processRestartRobot(params);
    }

    isSecurityVerifySuccess(): Observable<boolean> {
        return this.tipService.confirmOperateTip(VerifyPasswordComponent, 'PASSWORD')
            .filter(sure => !!sure)
            .switchMapTo(this.authService.verifyPasswordSuccess());
    }

    launchStopRobot(data: Observable<fromRes.RobotDetail>): Subscription {
        return this.process.processStopRobot(
            this.getRobotOperateConfirm(data)
                .filter(sure => !!sure)
                .mergeMapTo(data)
        );
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

    // publish robot
    getPublicRobotResponse(): Observable<fromRes.PublicRobotResponse> {
        return this.store.select(fromRoot.selectPublicRobotResponse)
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

    // robot logs
    private getRobotLogsResponse(): Observable<fromRes.GetRobotLogsResponse> {
        return this.store.select(fromRoot.selectRobotLogsResponse)
            .filter(res => !!res);
    }

    getRobotLogs(): Observable<fromRes.RobotLogs> {
        return this.getRobotLogsResponse()
            .map(res => res.result);
    }

    // restart robot
    private getRestartRobotResponse(): Observable<fromRes.RestartRobotResponse> {
        return this.store.select(fromRoot.selectRestartRobotResponse)
            .filter(res => !!res);
    }

    private getStopRobotResponse(): Observable<fromRes.StopRobotResponse> {
        return this.store.select(fromRoot.selectStopRobotResponse)
            .filter(res => !!res);
    }

    // ui state
    isLoading(): Observable<boolean> {
        return this.store.select(fromRoot.selectRobotOperationLoadingState);
    }

    getOperateBtnText(): Observable<string> {
        return this.getRobotDetail()
            .map(robot => getRobotOperateMap(robot.status).btnText)
            .combineLatest(
                this.isLoading(),
                (btnTexts: string[], isLoading) => isLoading ? btnTexts[1] || btnTexts[0] : btnTexts[0]
            );
    }

    getSelectedNode(): Observable<fromRes.BtNode> {
        return this.btNodeService.getNodeList()
            .zip(this.getRobotDetail(), ({ nodes }, { fixed_id }) => nodes.find(item => item.id === fixed_id))
    }

    isPublicNode(): Observable<boolean> {
        return this.getSelectedNode()
            .map(node => !!node && node.public === 1);
    }

    /* =======================================================Local state modify======================================================= */

    resetRobotDetail() {
        this.store.dispatch(new ResetRobotDetailAction());
    }

    /* =======================================================Error Handle======================================================= */

    handleRobotListError(): Subscription {
        return this.error.handleResponseError(this.getRobotListResState());
    }

    handlePublicRobotError(): Subscription {
        return this.error.handleResponseError(this.getPublicRobotResponse());
    }

    handleRobotDetailError(): Subscription {
        return this.error.handleResponseError(this.getRobotDetailResponse());
    }

    handleSubscribeRobotError(): Subscription {
        return this.error.handleResponseError(this.getSubscribeRobotResponse());
    }

    handleRobotLogsError(): Subscription {
        return this.error.handleResponseError(this.getRobotLogsResponse());
    }

    handleRobotRestartError(): Subscription {
        return this.error.handleError(
            this.getRestartRobotResponse()
                .map(res => res.error || this.error.getRestartRobotError(res.result))
        );
    }

    handleRobotStopError(): Subscription {
        return this.error.handleError(
            this.getStopRobotResponse()
                .map(res => res.error || this.error.getStopRobotError(res.result))
        )
    }
}
