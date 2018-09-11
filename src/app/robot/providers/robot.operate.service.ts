import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import * as fileSaver from 'file-saver';
import { flatten, isEmpty, isNaN } from 'lodash';
import * as moment from 'moment';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';
import {
    combineLatest, from as observableFrom, merge, Observable, of as observableOf, of, Subscription, zip
} from 'rxjs';
import {
    filter, map, mapTo, mergeMap, mergeMapTo, reduce, startWith, switchMap, switchMapTo, take, tap, withLatestFrom, takeWhile
} from 'rxjs/operators';

import { VariableType } from '../../app.config';
import { SelectedPair, TemplateVariableOverview, VariableOverview, keepAliveFn } from '../../interfaces/app.interface';
import * as fromReq from '../../interfaces/request.interface';
import * as fromRes from '../../interfaces/response.interface';
import { BtNodeService } from '../../providers/bt-node.service';
import { EncryptService } from '../../providers/encrypt.service';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import { PublicService } from '../../providers/public.service';
import { TipService } from '../../providers/tip.service';
import * as fromRoot from '../../store/index.reducer';
import {
    ModifyRobotArgAction, ResetRobotOperateAction, UpdateRobotWatchDogStateAction
} from '../../store/robot/robot.action';
import { isDeleteRobotFail } from '../../store/robot/robot.effect';
import {
    OPERATE_ROBOT_LOADING_TAIL, OPERATE_ROBOT_REQUEST_TAIL, RobotOperateType
} from '../../store/robot/robot.reducer';
import { VerifyPasswordComponent } from '../../tool/verify-password/verify-password.component';
import { DeleteRobotComponent } from '../delete-robot/delete-robot.component';
import { CommandRobotTip } from '../robot.config';
import { ImportedArg } from '../robot.interface';
import { RobotConstantService } from './robot.constant.service';
import { RobotBaseService } from './robot.service';

export interface RobotDebugFormModal {
    agent: number;
    platform: number;
    stock: string;
}

@Injectable()
export class RobotOperateService extends RobotBaseService {

    constructor(
        public store: Store<fromRoot.AppState>,
        private process: ProcessService,
        private error: ErrorService,
        public tipService: TipService,
        private pubService: PublicService,
        private btNodeService: BtNodeService,
        private translate: TranslateService,
        private constantService: RobotConstantService,
        private encryptService: EncryptService,
        private nzModal: NzModalService,
    ) {
        super(store, tipService);
    }

    //  =======================================================Serve Request=======================================================

    launchPublicRobot(data: Observable<fromRes.Robot>): Subscription {
        return this.process.processPublicRobot(this.getPublicRobotRequest(data));
    }

    /**
     *  1、验证能否切换平台；2、提示用户进行操作确认；3、如果公有节点需要验证密码；
     */
    launchRestartRobot(source: Observable<fromRes.RobotDetail | fromRes.Robot>, needVerifyPlatform = true): Subscription {
        const param1 = this.canChangePlatform().pipe(
            this.filterTruth(),
            switchMapTo(
                zip(
                    source.pipe(
                        switchMap(robot => this.tipService.guardRiskOperate(this.constantService.getRobotOperateMap(robot.status).tip)),
                        mergeMapTo(this.isPublicNode()),
                        switchMap(isPublic => isPublic ? this.isSecurityVerifySuccess() : observableOf(true)),
                    ),
                    source
                ).pipe(
                    map(([condition, data]) => condition && data && { id: data.id }),
                    this.filterTruth()
                )
            )
        );

        const param2 = (<Observable<fromRes.Robot>>source).pipe(
            switchMap(({ id, node_public, status }) => this.tipService.guardRiskOperate(this.constantService.getRobotOperateMap(status).tip).pipe(
                mergeMapTo(this.pubService.isLogin().pipe(
                    mergeMap(isLogin => !isLogin && node_public && node_public === 1 ? this.isSecurityVerifySuccess().pipe(
                        this.filterTruth(),
                        mapTo({ id })
                    ) : observableOf({ id }))
                )),
                take(1)
            ))
        );

        return this.process.processRestartRobot(needVerifyPlatform ? param1 : param2);
    }

    launchStopRobot(data: Observable<fromRes.RobotDetail | fromRes.Robot>): Subscription {
        return this.process.processStopRobot(
            data.pipe(
                switchMap(({ id, status }) => this.tipService.guardRiskOperate(this.constantService.getRobotOperateMap(status).tip).pipe(
                    mapTo({ id })
                ))
            )
        );
    }

    /**
     *  是否需要编码参数
     * 1 不需要：直接发送；
     * 2 需要：是否需要验证密码
     *      3 不需要： 编码并发送
     *      4 需要： 验证密码
     *          5 验证成功：编码并发送
     *          6 验证失败：不发送
     */
    launchUpdateRobotConfig(request: Observable<fromReq.ModifyRobotRequest>): Subscription {
        return this.process.processModifyRobot(request.pipe(
            switchMap(data => this.isArgsNeedToEncrypt().pipe(
                switchMap(need => need ? this.store.pipe(
                    select(fromRoot.selectTemporaryPwd),
                    map(pwd => !!pwd)
                ) : observableOf(true)),
                switchMap(pass => pass ? observableOf(true) : this.isSecurityVerifySuccess()),
                this.filterTruth(),
                mergeMapTo(this.getEncryptedArgs()),
                take(1),
                withLatestFrom(
                    this.getRobotDetail().pipe(
                        map(item => item.id)
                    ),
                    (args, id) => ({ ...data, args, id })
                )
            ))
        ));
    }

    launchCommandRobot(data: Observable<VariableOverview>): Subscription {
        return this.process.processCommandRobot(data.pipe(
            switchMap(variable => this.canSendCommandToRobot(variable).pipe(
                mapTo(this.getRobotCommand(variable))
            )
            ),
            withLatestFrom(
                this.getRobotDetail().pipe(
                    map(robot => robot.id)
                ),
                (command, id) => ({ id, command })
            ),
            switchMap(request =>
                this.tipService.guardRiskOperate('CONFIRM_SEND_COMMAND_TO_ROBOT_TIP', { cmd: this.constantService.withoutPrefix(request.command, this.constantService.COMMAND_PREFIX) }).pipe(
                    mapTo(request)
                )
            )
        ));
    }

    launchDeleteRobot(data: Observable<fromRes.Robot>): Subscription {
        return this.process.processDeleteRobot(data.pipe(
            withLatestFrom(this.tipService.getNzConfirmOperateConfig()),
            switchMap(([{ id }, config]) => {
                const modal: NzModalRef = this.nzModal.confirm(Object.assign({
                    nzContent: DeleteRobotComponent,
                    nzComponentParams: { id },
                    nzOnOk: component => modal.close(component.checked),
                }, config));

                return modal.afterClose.pipe(
                    this.filterTruth(),
                    map(checked => ({ id, checked }))
                );
            }),
        ));
    }

    launchDebugRobot(data: Observable<{ options: RobotDebugFormModal, content: string }>): Subscription {
        return this.process.processDebugRobot(data.pipe(
            map(({ options, content }) => ({
                period: 60,
                node: options.agent,
                exchanges: [{ pid: options.platform, pair: options.stock }],
                source: content,
            }))
        ));
    }

    //  =======================================================Date Acquisition=======================================================

    // publish robot
    private getPublicRobotResponse(): Observable<fromRes.PublicRobotResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectPublicRobotResponse)
        );
    }

    // restart robot
    private getRestartRobotResponse(): Observable<fromRes.RestartRobotResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectRestartRobotResponse)
        );
    }

    // stop robot
    private getStopRobotResponse(): Observable<fromRes.StopRobotResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectStopRobotResponse)
        );
    }

    // robot args
    getRobotStrategyArgs(): Observable<VariableOverview[]> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectRobotStrategyArgs),
            map(args => args.map(item => this.setSelectDefaultValue(item)))
        );
    }

    getRobotTemplateArgs(): Observable<TemplateVariableOverview[]> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectRobotTemplateArgs),
            mergeMap(templates => observableFrom(templates).pipe(
                map(tpl => ({ ...tpl, variables: tpl.variables.map(item => this.setSelectDefaultValue(item)) })),
                reduce((acc, cur) => [...acc, cur], [])
            )
            )
        );
    }

    getRobotCommandArgs(): Observable<VariableOverview[]> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectRobotCommandArgs),
            map(args => args.map(item => this.setSelectDefaultValue(item)))
        );
    }

    private setSelectDefaultValue(target: VariableOverview): VariableOverview {
        if (target.variableTypeId === VariableType.SELECT_TYPE && (<string>target.variableValue).indexOf(this.constantService.LIST_PREFIX) === 0) {
            target.variableValue = this.constantService.transformStringToList(<string>target.originValue)[0];
        } else {
            // nothing to do;
        }

        return target;
    }

    private isArgsNeedToEncrypt(): Observable<boolean> {
        return combineLatest(
            this.store.pipe(
                select(fromRoot.selectRobotStrategyArgs),
                map(args => !args ? false : this.encryptService.isNeedEncrypt(args))
            ),
            this.store.pipe(
                select(fromRoot.selectRobotTemplateArgs),
                map(templates => !templates ? false : this.encryptService.isNeedEncrypt(flatten(templates.map(item => item.variables))))
            )
        ).pipe(
            map(([strategyNeed, templateNeed]) => strategyNeed || templateNeed)
        );
    }

    getPairsParams(pairs: SelectedPair[]): { platform: number[], stocks: string[] } {
        return pairs.reduce((acc, cur) => ({
            platform: [...acc.platform, cur.platformId] as number[],
            stocks: [...acc.stocks, cur.stock] as string[],
        }),
            { platform: [], stocks: [] }
        );
    }

    hasArgs(): Observable<boolean> {
        return combineLatest(
            this.getRobotStrategyArgs().pipe(
                map(args => !!args && !!args.length)
            ),
            this.getRobotTemplateArgs().pipe(
                map(args => !!args && !!args.length)
            )
        ).pipe(
            map(([hasStrategyArgs, hasTemplateArgs]) => hasStrategyArgs || hasTemplateArgs),
            startWith(false)
        );
    }

    exportArgs(kLinePeriodId: number): Subscription {
        return this.getEncryptedArgs().pipe(
            withLatestFrom(
                this.getRobotDetail().pipe(
                    map(item => item.name)
                )
            ),
            take(1)
        ).subscribe(([args, name]) => {
            const data = JSON.stringify({
                timestamp: new Date().getTime(),
                period: kLinePeriodId,
                args: JSON.parse(args),
            });

            const exportName = `export_${name}_${moment().format('YYMMDDhhmmss')}.json`;

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
                    .subscribe(msg => this.tipService.messageSuccess(msg + moment(result.timestamp).format('YY-MM-DD HH:mm:ss')));
            });
        } catch (error) {
            this.tipService.messageError('IMPORT_ARGUMENT_FAIL_TIP');
        }
    }

    // robot command
    private getCommandRobotResponse(): Observable<fromRes.CommandRobotResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectCommandRobotResponse)
        );
    }

    // delete robot
    private getDeleteRobotResponse(): Observable<fromRes.DeleteRobotResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectDeleteRobotResponse)
        );
    }

    monitorDeleteRobotResult(keeAlive: () => boolean): Subscription {
        return this.getDeleteRobotResponse().pipe(
            filter(res => !isDeleteRobotFail(res)),
            map(res => res.result),
            withLatestFrom(
                this.store.pipe(
                    select(fromRoot.selectRobotRequestParameters),
                    filter(params => !!params && !!params.deleteRobot),
                    map(state => state.deleteRobot.id)
                )
            ),
            takeWhile(keeAlive)
        ).subscribe(([result, id]) => {
            if (this.deleteRobotLogFail(result)) {
                this.tipService.messageError('DELETE_ROBOT_SUCCESS_BUT_LOG', { id });
            } else {
                this.tipService.messageSuccess('DELETE_ROBOT_SUCCESS');
            }
        });
    }

    private deleteRobotLogFail(code: number): boolean {
        return Math.abs(code) === 2;
    }

    // plugin run
    private getPluginRunResponse(): Observable<fromRes.PluginRunResult> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectPluginRunResponse),
            map(res => JSON.parse(res.result))
        );
    }

    getPluginRunResult(): Observable<any> {
        return this.getPluginRunResponse().pipe(
            map(res => JSON.parse(res.result))
        );
    }

    getPluginRunLogs(): Observable<fromRes.DebugLog[]> {
        return this.getPluginRunResponse().pipe(
            map(res => res.logs)
        );
    }

    // ui state
    isLoading(type?: string): Observable<boolean> {
        return this.store.pipe(
            select(fromRoot.selectRobotUiState),
            map(state => type ? state[type + OPERATE_ROBOT_LOADING_TAIL] : state.loading)
        );
    }

    isCurrentRobotOperating(robot: fromRes.Robot, operateType: string): Observable<boolean> {
        return this.isLoading(operateType).pipe(
            withLatestFrom(
                this.store.pipe(
                    select(fromRoot.selectRobotRequestParameters),
                    filter(res => !!res && !!res[operateType + OPERATE_ROBOT_REQUEST_TAIL]),
                    map(res => res[operateType + OPERATE_ROBOT_REQUEST_TAIL].id))
            ),
            filter(([_, id]) => robot.id === id),
            map(([loading, _]) => loading),
            startWith(false)
        );
    }

    getOperateBtnText(): Observable<string> {
        return combineLatest(
            this.getRobotDetail().pipe(
                map(robot => this.constantService.getRobotOperateMap(robot.status).btnText),
            ),
            merge(
                this.isLoading(RobotOperateType.stop),
                this.isLoading(RobotOperateType.restart)
            )
        ).pipe(
            map(([btnTexts, isLoading]) => this.constantService.getRobotOperateBtnText(isLoading, btnTexts))
        );
    }

    getRobotWatchDogBtnText(): Observable<string> {
        return this.getRobotDetail().pipe(
            map(robot => robot.wd === 0 ? 'MONITOR' : 'CANCEL')
        );
    }

    private getSelectedNode(): Observable<fromRes.BtNode> {
        return zip(
            this.btNodeService.getNodeList(),
            this.getRobotDetail(),
            (nodes, { fixed_id }) => nodes.find(item => item.id === fixed_id)
        );
    }

    private getBindNode(): Observable<fromRes.BtNode> {
        return zip(
            this.btNodeService.getNodeList(),
            this.getRobotDetail()
        ).pipe(
            map(([nodes, { node_id, fixed_id }]) => {
                const node = nodes.find(item => item.id === fixed_id);

                if (node) {
                    return node;
                } else if (node_id > 0) {
                    return nodes.find(item => item.id === node_id) || null;
                } else {
                    return null;
                }
            })
        );
    }

    private isPublicNode(): Observable<boolean> {
        return this.getSelectedNode().pipe(
            map(node => !!node && node.public === 1)
        );
    }

    getRobotStatusTip(): Observable<string> {
        return merge(
            this.getSelectedNode().pipe(
                mergeMap(node => !!node ? observableOf('') : this.translate.get('DOCKER_OFF_LINE_TIP')),
                this.filterTruth()
            ),
            this.getBindNode().pipe(
                withLatestFrom(
                    this.getRobotDetail(),
                    this.getSelectedNode(),
                    (node, robot, selectedNode) => {
                        const hasNode = node && node.id !== -1;

                        if (hasNode) {
                            return this.translate.get('DOCKER_ON').pipe(
                                map(label => label + node.name + robot.id)
                            );
                        } else if (robot.status === 0 && !hasNode) {
                            return this.translate.get('WAIT').pipe(
                                map(label => label + selectedNode.name)
                            );
                        } else {
                            return observableOf('');
                        }
                    }),
                mergeMap(obs => obs),
                this.filterTruth()
            )
        );
    }

    getRobotConfigMessage(): Observable<string> {
        return this.getBindNode().pipe(
            withLatestFrom(this.pubService.isLogin()),
            mergeMap(([bindNode, isLogin]) => {
                if (!!bindNode && (bindNode.public === 1) && !bindNode.is_owner && isLogin) {
                    return this.translate.get('ROBOT_RUNNING_ON_PUBLIC_WARING', bindNode);
                } else {
                    return observableOf('');
                }
            }),
            this.filterTruth()
        );
    }

    //  =======================================================Short cart method==================================================

    private getEncryptedArgs(isEncrypt = true): Observable<string> {
        return combineLatest(
            this.encryptService.transformStrategyArgsToEncryptType(
                this.store.pipe(
                    select(fromRoot.selectRobotStrategyArgs),
                    map(args => args || [])
                ),
                isEncrypt
            ),
            this.encryptService.transformTemplateArgsToEncryptType(
                this.store.pipe(
                    select(fromRoot.selectRobotTemplateArgs),
                    map(args => args || [])
                ),
                isEncrypt
            )
        ).pipe(
            map(([strategyArgs, templateArgs]) => JSON.stringify([...strategyArgs, ...templateArgs]))
        );
    }

    private getPublicRobotRequest(robotObs: Observable<fromRes.Robot>): Observable<fromReq.PublicRobotRequest> {
        return robotObs.pipe(
            switchMap(robot => this.tipService.guardRiskOperate(robot.public ? 'CANCEL_PUBLISH_ROBOT_CONFIRM' : 'PUBLISH_ROBOT_CONFIRM').pipe(
                mapTo({ id: robot.id, type: Number(!robot.public) })
            ))
        );
    }

    /**
     * 验证密码成功后的通知流；
     */
    private isSecurityVerifySuccess(): Observable<boolean> {
        return this.store.pipe(
            select(fromRoot.selectTemporaryPwd),
            map(pwd => !!pwd),
            switchMap(verified => verified ? of(true) : this.tipService.securityVerify(VerifyPasswordComponent))
        );
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
        return this.getRobotDetail().pipe(
            map(robot => robot.status !== 1),
            withLatestFrom(
                observableOf(variable.variableTypeId === VariableType.NUMBER_TYPE && isNaN(<number>variable.variableValue)),
                observableOf(variable.variableTypeId === VariableType.STRING_TYPE && isEmpty(<string>variable.variableValue)),
                observableOf(this.getRobotCommand(variable).length > 200),
                (isNotRunning, invalidNumberType, emptyStringType, overBoundary) =>
                    [
                        isNotRunning && CommandRobotTip.invalidRobotState,
                        invalidNumberType && CommandRobotTip.invalidNumberTypeArg,
                        emptyStringType && CommandRobotTip.invalidStringTypeArg,
                        overBoundary && CommandRobotTip.invalidCommandLength,
                    ]
            ),
            map(result => result.find(item => !!item) || ''),
            tap(tip => !isEmpty(tip) && this.tipService.messageInfo(tip)),
            filter(tip => !tip),
            map(tip => isEmpty(tip))
        );
    }

    //  =======================================================Local state modify==================================================

    updateRobotArg(variable: VariableOverview | ImportedArg, templateFlag?: string | number): void {
        this.store.dispatch(new ModifyRobotArgAction(variable, templateFlag));
    }

    resetRobotOperate(): void {
        this.store.dispatch(new ResetRobotOperateAction());
    }

    updateRobotWDState(target: Observable<fromReq.SetWDRequest>): Subscription {
        return target.subscribe(request => this.store.dispatch(new UpdateRobotWatchDogStateAction(request)));
    }

    //  =======================================================Error Handle=======================================================

    handlePublicRobotError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getPublicRobotResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    handleRobotRestartError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleError(
            this.getRestartRobotResponse().pipe(
                map(res => res.error || this.error.getRestartRobotError(res.result)),
                takeWhile(keepAlive)
            )
        );
    }

    handleRobotStopError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleError(
            this.getStopRobotResponse().pipe(
                map(res => res.error || this.error.getStopRobotError(res.result)),
                takeWhile(keepAlive)
            )
        );
    }

    handleCommandRobotError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getCommandRobotResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    handleDeleteRobotError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleError(
            this.getDeleteRobotResponse().pipe(
                map(res => res.error || this.error.getDeleteRobotError(res.result)),
                takeWhile(keepAlive)
            )
        );
    }
}
