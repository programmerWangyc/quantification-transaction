import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/delayWhen';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/switchMapTo';
import 'rxjs/add/operator/withLatestFrom';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import * as fileSaver from 'file-saver';
import { flatten, isEmpty, isNaN } from 'lodash';
import * as moment from 'moment';
import { NzModalService } from 'ng-zorro-antd';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { VariableType } from '../../app.config';
import { BaseService } from '../../base/base.service';
import { AuthService } from '../../shared/providers/auth.service';
import {
    ModifyRobotArgAction,
    ResetRobotOperateAction,
    UpdateRobotWatchDogStateAction,
} from '../../store/robot/robot.action';
import { isDeleteRobotFail } from '../../store/robot/robot.effect';
import { OPERATE_ROBOT_LOADING_TAIL, OPERATE_ROBOT_REQUEST_TAIL, RobotOperateType } from '../../store/robot/robot.reducer';
import { ConfirmComponent } from '../../tool/confirm/confirm.component';
import { VerifyPasswordComponent } from '../../tool/verify-password/verify-password.component';
import { DeleteRobotComponent } from '../delete-robot/delete-robot.component';
import { RobotConstantService } from '../providers/robot.constant.service';
import { CommandRobotTip } from '../robot.config';
import { ImportedArg } from '../robot.interface';
import { SelectedPair, TemplateVariableOverview, VariableOverview } from './../../interfaces/app.interface';
import * as fromReq from './../../interfaces/request.interface';
import * as fromRes from './../../interfaces/response.interface';
import { BtNodeService } from './../../providers/bt-node.service';
import { EncryptService } from './../../providers/encrypt.service';
import { ErrorService } from './../../providers/error.service';
import { ProcessService } from './../../providers/process.service';
import { PublicService } from './../../providers/public.service';
import { TipService } from './../../providers/tip.service';
import * as fromRoot from './../../store/index.reducer';

export interface RobotDebugFormModal {
    agent: number;
    platform: number;
    stock: string;
}

@Injectable()
export class RobotOperateService extends BaseService {

    constructor(
        private store: Store<fromRoot.AppState>,
        private process: ProcessService,
        private error: ErrorService,
        private tipService: TipService,
        private pubService: PublicService,
        private btNodeService: BtNodeService,
        private authService: AuthService,
        private translate: TranslateService,
        private constantService: RobotConstantService,
        private encryptService: EncryptService,
        private nzModal: NzModalService,
    ) {
        super();
    }

    /* =======================================================Serve Request======================================================= */

    launchPublicRobot(data: Observable<fromRes.Robot>): Subscription {
        return this.process.processPublicRobot(this.getPublicRobotRequest(data));
    }

    /**
     * @description 1、验证能否切换平台；2、提示用户进行操作确认；3、如果公有节点需要验证密码；
     */
    launchRestartRobot(data: Observable<fromRes.RobotDetail | fromRes.Robot>, needVerifyPlatform = true): Subscription {

        const param1 = this.canChangePlatform()
            .filter(sure => sure)
            .switchMapTo(this.getRobotOperateConfirm(data)
                .filter(sure => sure)
                .mergeMapTo(this.isPublicNode())
                .switchMap(isPublic => isPublic ? this.isSecurityVerifySuccess() : Observable.of(true))
                .zip(data, (condition, data) => condition && data)
                .filter(value => !!value)
                .map(({ id }) => ({ id })));

        /**
         * FIXME: 这里如果调用 this.getRobotOperateConfirm 实测并不能取到第一个值， why?
         */
        const param2 = (<Observable<fromRes.Robot>>data)
            .switchMap(({ id, node_public, status }) => this.tipService.confirmOperateTip(ConfirmComponent, { message: this.constantService.getRobotOperateMap(status).tip, needTranslate: true })
                .filter(v => !!v)
                .mergeMapTo(this.pubService.isLogin()
                    .mergeMap(isLogin => !isLogin && node_public && node_public === 1 ? this.isSecurityVerifySuccess().filter(v => !!v).mapTo({ id }) : Observable.of({ id }))
                )
            );

        return this.process.processRestartRobot(needVerifyPlatform ? param1 : param2);
    }

    launchStopRobot(data: Observable<fromRes.RobotDetail | fromRes.Robot>): Subscription {
        return this.process.processStopRobot(
            data.switchMap(({ id, status }) => this.tipService.confirmOperateTip(
                ConfirmComponent,
                { message: this.constantService.getRobotOperateMap(status).tip, needTranslate: true })
                .filter(sure => sure)
                .mapTo({ id })
            )
        );
    }

    /**
     * @description 是否需要编码参数
     * 1 不需要：直接发送；
     * 2 需要：是否需要验证密码
     *      3 不需要： 编码并发送
     *      4 需要： 验证密码
     *          5 验证成功：编码并发送
     *          6 验证失败：不发送
     */
    launchUpdateRobotConfig(data: Observable<fromReq.ModifyRobotRequest>): Subscription {
        return this.process.processModifyRobot(data.switchMap(data => this.isArgsNeedToEncrypt()
            .switchMap(need => need ? this.store.select(fromRoot.selectTemporaryPwd).map(pwd => !!pwd) : Observable.of(true))
            .switchMap(pass => pass ? Observable.of(true) : this.isSecurityVerifySuccess())
            .filter(v => !!v)
            .mergeMapTo(this.getEncryptedArgs())
            .take(1)
            .withLatestFrom(
                this.getRobotDetail().map(item => item.id),
                (args, id) => ({ ...data, args, id })
            )
        ));
    }

    launchCommandRobot(data: Observable<VariableOverview>): Subscription {
        return this.process.processCommandRobot(
            data.switchMap(variable => this.canSendCommandToRobot(variable).mapTo(this.getRobotCommand(variable)))
                .withLatestFrom(
                    this.getRobotDetail().map(robot => robot.id),
                    (command, id) => ({ id, command })
                )
                .switchMap(request => this.translate.get('CONFIRM_SEND_COMMAND_TO_ROBOT_TIP', { cmd: this.constantService.withoutPrefix(request.command, this.constantService.COMMAND_PREFIX) })
                    .mergeMap(message => this.tipService.confirmOperateTip(ConfirmComponent, { message, needTranslate: false }))
                    .filter(confirm => confirm)
                    .mapTo(request)
                )
        );
    }

    launchDeleteRobot(data: Observable<fromRes.Robot>): Subscription {
        return this.process.processDeleteRobot(
            data.withLatestFrom(this.tipService.getNzConfirmOperateConfig())
                .switchMap(([{ id }, config]) => {
                    const modal = this.nzModal.confirm(Object.assign({
                        nzContent: DeleteRobotComponent,
                        nzComponentParams: { id },
                        nzOnOk: component => modal.close(component.checked),
                    }, config));

                    return modal.afterClose.filter(res => !!res).map(checked => ({ id, checked }));
                })
        );
    }

    launchDebugRobot(data: Observable<{ options: RobotDebugFormModal, content: string }>): Subscription {
        return this.process.processDebugRobot(data.map(({ options, content }) => ({
            period: 60,
            node: options.agent,
            exchanges: [{ pid: options.platform, pair: options.stock }],
            source: content
        })));
    }

    /* =======================================================Date Acquisition======================================================= */

    // publish robot
    getPublicRobotResponse(): Observable<fromRes.PublicRobotResponse> {
        return this.store.select(fromRoot.selectPublicRobotResponse)
            .filter(res => !!res);
    }

    getPublicRobotLoadingState(): Observable<boolean> {
        return this.store.select(fromRoot.selectRobotUiState).map(res => res.publicRobotLoading);
    }

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

    // restart robot
    private getRestartRobotResponse(): Observable<fromRes.RestartRobotResponse> {
        return this.store.select(fromRoot.selectRestartRobotResponse)
            .filter(res => !!res);
    }

    // stop robot
    private getStopRobotResponse(): Observable<fromRes.StopRobotResponse> {
        return this.store.select(fromRoot.selectStopRobotResponse)
            .filter(res => !!res);
    }

    // robot args
    getRobotStrategyArgs(): Observable<VariableOverview[]> {
        return this.store.select(fromRoot.selectRobotStrategyArgs)
            .filter(v => !!v)
            .map(args => args.map(item => this.setSelectDefaultValue(item)));
    }

    getRobotTemplateArgs(): Observable<TemplateVariableOverview[]> {
        return this.store.select(fromRoot.selectRobotTemplateArgs)
            .filter(v => !!v)
            .mergeMap(templates => Observable.from(templates)
                .map(tpl => ({ ...tpl, variables: tpl.variables.map(item => this.setSelectDefaultValue(item)) }))
                .reduce((acc, cur) => [...acc, cur], [])
            );
    }

    getRobotCommandArgs(): Observable<VariableOverview[]> {
        return this.store.select(fromRoot.selectRobotCommandArgs)
            .filter(v => !!v)
            .map(args => args.map(item => this.setSelectDefaultValue(item)));
    }

    private setSelectDefaultValue(target: VariableOverview): VariableOverview {
        if (target.variableTypeId === VariableType.SELECT_TYPE && (<string>target.variableValue).indexOf(this.constantService.LIST_PREFIX) === 0) {
            target.variableValue = this.constantService.transformStringToList(<string>target.originValue)[0];
        } else {
            // nothing to do;
        }
        return target;
    }

    isArgsNeedToEncrypt(): Observable<boolean> {
        return this.store.select(fromRoot.selectRobotStrategyArgs)
            .map(args => !args ? false : this.encryptService.isNeedEncrypt(args))
            .combineLatest(
                this.store.select(fromRoot.selectRobotTemplateArgs)
                    .map(templates => !templates ? false : this.encryptService.isNeedEncrypt(flatten(templates.map(item => item.variables)))),
                (strategyNeed, templateNeed) => strategyNeed || templateNeed
            )
    }

    getPairsParams(pairs: SelectedPair[]): { platform: number[], stocks: string[] } {
        return pairs.reduce((acc, cur) => ({
            platform: [...acc.platform, cur.platformId] as number[],
            stocks: [...acc.stocks, cur.stock] as string[]
        }),
            { platform: [], stocks: [] }
        )
    }

    hasArgs(): Observable<boolean> {
        return this.getRobotStrategyArgs()
            .map(args => !!args && !!args.length)
            .combineLatest(this.getRobotTemplateArgs().map(args => !!args && !!args.length))
            .map(([hasStrategyArgs, hasTemplateArgs]) => hasStrategyArgs || hasTemplateArgs)
            .startWith(false);
    }

    exportArgs(kLinePeriodId: number): Subscription {
        return this.getEncryptedArgs()
            .withLatestFrom(this.getRobotDetail().map(item => item.name))
            .subscribe(([args, name]) => {
                const data = JSON.stringify({
                    timestamp: new Date().getTime(),
                    period: kLinePeriodId,
                    args: JSON.parse(args)
                });

                const exportName = `export_${name}_${moment().format('YYMMDDhhmmss')}.json`

                fileSaver.saveAs(new Blob([data], { type: 'application/json;charset=utf8;' }), exportName);
            });
    }

    importArgs(result: { [key: string]: any }): void {
        try {
            result.args.forEach(ary => {
                const [variableName, variableValue, templateId] = ary;

                if (templateId) {
                    this.updateRobotArg({ variableName, variableValue }, templateId);
                } else {
                    this.updateRobotArg({ variableName, variableValue });
                }

                this.translate.get('ARGUMENT_CONFIG_FILE_TIME')
                    .subscribe(msg => this.tipService.showTip(msg + moment(result.timestamp).format('YY-MM-DD hh:mm:ss')));
            });
        } catch (error) {
            this.tipService.showTip('IMPORT_ARGUMENT_FAIL_TIP');
        }
    }

    // robot command
    getCommandRobotResponse(): Observable<fromRes.CommandRobotResponse> {
        return this.store.select(fromRoot.selectCommandRobotResponse)
            .filter(v => !!v);
    }

    // delete robot
    getDeleteRobotResponse(): Observable<fromRes.DeleteRobotResponse> {
        return this.store.select(fromRoot.selectDeleteRobotResponse)
            .filter(v => !!v);
    }

    monitorDeleteRobotResult(): Subscription {
        return this.getDeleteRobotResponse()
            .filter(res => !isDeleteRobotFail(res))
            .map(res => res.result)
            .withLatestFrom(this.store.select(fromRoot.selectRobotRequestParameters).filter(params => !!params && !!params.deleteRobot).map(state => state.deleteRobot.id))
            .mergeMap(([result, id]) => {
                const message = this.deleteRobotLogFail(result) ? 'DELETE_ROBOT_SUCCESS_BUT_LOG' : 'DELETE_ROBOT_SUCCESS';

                return this.translate.get(message, { id });
            })
            .subscribe(message => this.tipService.showTip(message));
    }

    deleteRobotLogFail(code: number): boolean {
        return Math.abs(code) === 2;
    }

    // plugin run
    private getPluginRunResponse(): Observable<fromRes.PluginRunResult> {
        return this.store.select(fromRoot.selectPluginRunResponse)
            .filter(this.isTruth)
            .map(res => JSON.parse(res.result));
    }

    getPluginRunResult(): Observable<any> {
        return this.getPluginRunResponse().map(res => JSON.parse(res.result));
    }

    getPluginRunLogs(): Observable<fromRes.DebugLog[]> {
        return this.getPluginRunResponse().map(res => res.logs);
    }

    // ui state
    isLoading(type?: string): Observable<boolean> {
        return this.store.select(fromRoot.selectRobotUiState).map(state => type ? state[type] : state.loading);
    }

    isCurrentRobotOperating(robot: fromRes.Robot, operateType: string): Observable<boolean> {
        return this.isLoading(operateType + OPERATE_ROBOT_LOADING_TAIL)
            .withLatestFrom(this.store.select(fromRoot.selectRobotRequestParameters).filter(res => !!res && !!res[operateType + OPERATE_ROBOT_REQUEST_TAIL]).map(res => res[operateType + OPERATE_ROBOT_REQUEST_TAIL].id))
            .filter(([loading, id]) => robot.id === id)
            .map(([loading, _]) => loading)
            .startWith(false);
    }

    isDebugLoading(): Observable<boolean> {
        return this.store.select(fromRoot.selectRobotUiState)
            .map(state => state.debugLoading);
    }

    getOperateBtnText(): Observable<string> {
        return this.getRobotDetail()
            .map(robot => this.constantService.getRobotOperateMap(robot.status).btnText)
            .combineLatest(
                this.isLoading(RobotOperateType.stop + OPERATE_ROBOT_LOADING_TAIL).merge(this.isLoading(RobotOperateType.restart + OPERATE_ROBOT_LOADING_TAIL)),
                (btnTexts: string[], isLoading: boolean) => this.constantService.getRobotOperateBtnText(isLoading, btnTexts)
            );
    }

    getRobotWatchDogBtnText(): Observable<string> {
        return this.getRobotDetail()
            .map(robot => robot.wd === 0 ? 'MONITOR' : 'CANCEL');
    }

    getSelectedNode(): Observable<fromRes.BtNode> {
        return this.btNodeService.getNodeList()
            .zip(this.getRobotDetail(), (nodes, { fixed_id }) => nodes.find(item => item.id === fixed_id))
    }

    getBindNode(): Observable<fromRes.BtNode> {
        return this.btNodeService.getNodeList()
            .zip(
                this.getRobotDetail(),
                (nodes, { node_id, fixed_id }) => {
                    const node = nodes.find(item => item.id === fixed_id);

                    if (node) {
                        return node;
                    } else if (node_id > 0) {
                        return nodes.find(item => item.id === node_id) || null
                    } else {
                        return null;
                    }
                }
            );
    }

    isPublicNode(): Observable<boolean> {
        return this.getSelectedNode()
            .map(node => !!node && node.public === 1);
    }

    getRobotStatusTip(): Observable<string> {
        return this.getSelectedNode()
            .mergeMap(node => !!node ? Observable.of('') : this.translate.get('DOCKER_OFF_LINE_TIP'))
            .filter(tip => !!tip)
            .merge(
                this.getBindNode()
                    .withLatestFrom(
                        this.getRobotDetail(),
                        this.getSelectedNode(),
                        (node, robot, selectedNode) => {
                            const hasNode = node && node.id !== -1;

                            if (hasNode) {
                                return this.translate.get('DOCKER_ON').map(label => label + node.name + robot.id)
                            } else if (robot.status === 0 && !hasNode) {
                                return this.translate.get('WAIT').map(label => label + selectedNode.name)
                            } else {
                                return Observable.of('');
                            }
                        })
                    .mergeMap(obs => obs)
                    .filter(tip => !!tip)
            )
    }

    getRobotConfigMessage(): Observable<string> {
        return this.getBindNode()
            .withLatestFrom(this.pubService.isLogin())
            .mergeMap(([bindNode, isLogin]) => {
                if (!!bindNode && (bindNode.public === 1) && !bindNode.is_owner && isLogin) {
                    return this.translate.get('ROBOT_RUNNING_ON_PUBLIC_WARING', bindNode);
                } else {
                    return Observable.of('');
                }
            })
            .filter(v => !!v);
    }

    /* =======================================================Short cart method================================================== */



    private getEncryptedArgs(isEncrypt = true): Observable<string> {
        return this.encryptService.transformStrategyArgsToEncryptType(this.store.select(fromRoot.selectRobotStrategyArgs).map(args => args || []), isEncrypt)
            .combineLatest(
                this.encryptService.transformTemplateArgsToEncryptType(this.store.select(fromRoot.selectRobotTemplateArgs).map(args => args || []), isEncrypt),
                (strategyArgs, templateArgs) => [...strategyArgs, ...templateArgs]
            )
            .map(args => JSON.stringify(args));
    }

    /**
     * FIXME:switch组件在点击动作发生后立即进行了状态切换，所以需要在检查用户确认状态后再次检查开关的状态，如果用户放弃切换动作需要把
     * 开关的状态切换回去。开关状态能否变更实际要等到服务器响应后，所以在接收到响应时还需要再次检查。
     */
    private getPublicRobotRequest(robot: Observable<fromRes.Robot>): Observable<fromReq.PublicRobotRequest> {
        return robot.switchMap(robot => this.tipService.confirmOperateTip(
            ConfirmComponent,
            { message: robot.public ? 'PUBLISH_ROBOT_CONFIRM' : 'CANCEL_PUBLISH_ROBOT_CONFIRM', needTranslate: true },
        )
            .do(sure => !sure && (robot.public = Number(!robot.public)))
            .filter(sure => !!sure)
            .mapTo({ id: robot.id, type: Number(robot.public) })
        );
    }

    private getRobotOperateConfirm(robot: Observable<fromRes.RobotDetail | fromRes.Robot>): Observable<boolean> {
        return robot.switchMap(robot => this.tipService.confirmOperateTip(
            ConfirmComponent,
            { message: this.constantService.getRobotOperateMap(robot.status).tip, needTranslate: true }
        ));
    }

    private isSecurityVerifySuccess(): Observable<boolean> {
        return this.tipService.confirmOperateTip(VerifyPasswordComponent, { message: 'PASSWORD', needTranslate: true })
            .filter(sure => !!sure)
            .switchMapTo(this.authService.verifyPasswordSuccess());
    }

    private getRobotCommand(data: VariableOverview): string {
        switch (data.variableTypeId) {
            case 3:
                return data.variableName + ':' + this.constantService.transformStringToList((<string>data.originValue)).findIndex(item => item === data.variableValue);

            case 5:
                return data.variableName;

            default:
                return data.variableName + ':' + data.variableValue;
        }
    }

    private canSendCommandToRobot(variable: VariableOverview): Observable<boolean> {
        return this.getRobotDetail()
            .map(robot => robot.status !== 1)
            .withLatestFrom(
                Observable.of(variable.variableTypeId === VariableType.NUMBER_TYPE && isNaN(<number>variable.variableValue)),
                Observable.of(variable.variableTypeId === VariableType.STRING_TYPE && isEmpty(<string>variable.variableValue)),
                Observable.of(this.getRobotCommand(variable).length > 200),
                (isNotRunning, invalidNumberType, emptyStringType, overBoundary) =>
                    [
                        isNotRunning && CommandRobotTip.invalidRobotState,
                        invalidNumberType && CommandRobotTip.invalidNumberTypeArg,
                        emptyStringType && CommandRobotTip.invalidStringTypeArg,
                        overBoundary && CommandRobotTip.invalidCommandLength
                    ]
            )
            .map(result => result.find(item => !!item) || '')
            .do(tip => !isEmpty(tip) && this.tipService.showTip(tip))
            .filter(tip => !tip)
            .map(tip => isEmpty(tip));
    }

    /* =======================================================Local state modify================================================== */

    updateRobotArg(variable: VariableOverview | ImportedArg, templateFlag?: string | number): void {
        this.store.dispatch(new ModifyRobotArgAction(variable, templateFlag));
    }

    resetRobotOperate(): void {
        this.store.dispatch(new ResetRobotOperateAction());
    }

    updateRobotWDState(target: Observable<fromReq.SetRobotWDRequest>): Subscription {
        return target.subscribe(request => this.store.dispatch(new UpdateRobotWatchDogStateAction(request)));
    }

    /* =======================================================Error Handle======================================================= */

    handlePublicRobotError(): Subscription {
        return this.error.handleResponseError(this.getPublicRobotResponse());
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

    handleCommandRobotError(): Subscription {
        return this.error.handleResponseError(this.getCommandRobotResponse())
    }

    handleDeleteRobotError(): Subscription {
        return this.error.handleError(
            this.getDeleteRobotResponse()
                .map(res => res.error || this.error.getDeleteRobotError(res.result))
        )
    }
}
