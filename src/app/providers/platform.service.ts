import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { flattenDeep } from 'lodash';
import { from as observableFrom, Observable, Subscription } from 'rxjs';
import {
    distinctUntilChanged, filter, groupBy, map, mapTo, mergeMap, reduce, switchMap, takeWhile, withLatestFrom
} from 'rxjs/operators';

import { BaseService } from '../base/base.service';
import { GetPlatformDetailRequest, SavePlatformRequest } from '../interfaces/request.interface';
import {
    DeletePlatformResponse, GetPlatformDetailResponse, GetPlatformListResponse, Platform, PlatformAccessKey,
    PlatformDetail, SavePlatformResponse
} from '../interfaces/response.interface';
import * as fromRoot from '../store/index.reducer';
import { ResetStateAction } from '../store/platform/platform.action';
import { ConstantService } from './constant.service';
import { ErrorService } from './error.service';
import { ProcessService } from './process.service';
import { PublicService } from './public.service';
import { TipService } from './tip.service';

export interface GroupPlatform extends Platform {
    group: string;
}

export interface GroupedPlatform {
    group: string;
    platforms: GroupPlatform[];
}

export interface SavePlatformInfo {
    operate: string;
    result: string;
    isSuccess: boolean;
    errorReason: string;
}

export interface PreviousPlatformInfo {
    regionIndex: number;
    providerIndex: number;
    quotaServer: string;
    tradeServer: string;
    brokerId: string;
    brokerIndex: number;
}

@Injectable()
export class PlatformService extends BaseService {

    constructor(
        private store: Store<fromRoot.AppState>,
        private error: ErrorService,
        private process: ProcessService,
        private translate: TranslateService,
        private tip: TipService,
        private publicService: PublicService,
        private constant: ConstantService,
    ) {
        super();
    }

    //  =======================================================Serve Request=======================================================

    /**
     * 请求 platform list;
     * @param data command to request platform list;
     */
    launchGetPlatformList(data: Observable<any>): Subscription {
        return this.process.processGetPlatformList(data);
    }

    /**
     * 删除 platform
     */
    launchDeletePlatform(platformObs: Observable<Platform>): Subscription {
        return this.process.processDeletePlatform(platformObs.pipe(
            switchMap(platform => this.tip.guardRiskOperate('DELETE_EXCHANGE_TIP', { name: platform.name }).pipe(
                mapTo({ id: platform.id })
            ))
        ));
    }

    /**
     * 请求平台详情
     */
    launchGetPlatformDetail(idObs: Observable<GetPlatformDetailRequest>): Subscription {
        return this.process.processGetPlatformDetail(idObs);
    }

    /**
     * 更新交易所信息
     */
    launchUpdatePlatform(paramsObs: Observable<SavePlatformRequest>): Subscription {
        return this.process.processUpdatePlatform(paramsObs);
    }

    //  =======================================================Date Acquisition=======================================================

    /**
     * platform list response;
     */
    private getPlatformListResponse(): Observable<GetPlatformListResponse> {
        return this.store.select(fromRoot.selectPlatformListResponse).pipe(
            this.filterTruth()
        );
    }

    /**
     * Get platforms from the response of platform list response;
     */
    getPlatformList(): Observable<Platform[]> {
        return this.getPlatformListResponse().pipe(
            map(res => res.result.platforms)
        );
    }

    /**
     * 获取分组后的 platform list;
     */
    groupPlatformList(): Observable<GroupedPlatform[]> {
        return this.getPlatformList().pipe(
            mergeMap(list => observableFrom(list).pipe(
                map(platform => {
                    if (platform.eid === 'Futures_CTP') {
                        platform['group'] = 'ctp';
                    } else if (platform.eid === 'Futures_LTS') {
                        platform['group'] = 'lts';
                    } else {
                        platform['group'] = 'botvs';
                    }
                    return <GroupPlatform>platform;
                })
            )),
            groupBy(item => item.group),
            mergeMap((obs: Observable<GroupPlatform>) => obs.pipe(
                reduce((acc: GroupedPlatform, cur: GroupPlatform) => {
                    const { group } = cur;

                    const platforms = [...acc.platforms, cur];

                    return { group, platforms };

                }, { group: '', platforms: [] })
            )),
            reduce((acc, cur) => [...acc, cur], []),
        );
    }

    /**
     * Whether is loading platform;
     */
    isPlatformLoading(): Observable<boolean> {
        return this.store.pipe(
            select(fromRoot.selectPlatformIsLoading)
        );
    }

    /**
     * Response of delete platform
     */
    private getDeletePlatformResponse(): Observable<DeletePlatformResponse> {
        return this.store.pipe(
            select(fromRoot.selectPlatformDeleteResponse),
            this.filterTruth()
        );
    }

    /**
     * 获取平台详情的响应
     */
    private getPlatformDetailResponse(): Observable<GetPlatformDetailResponse> {
        return this.store.pipe(
            select(fromRoot.selectPlatformDetailResponse),
            this.filterTruth()
        );
    }

    /**
     * 获取交易平台详情
     */
    getPlatformDetail(): Observable<PlatformDetail> {
        return this.getPlatformDetailResponse().pipe(
            map(res => res.result.platform)
        );
    }

    /**
     * 获取更新平台的响应
     */
    private getUpdatePlatformResponse(): Observable<SavePlatformResponse> {
        return this.store.pipe(
            select(fromRoot.selectPlatformUpdateResponse),
            this.filterTruth()
        );
    }

    /**
     * 平台更新是否成功
     */
    private isUpdatePlatformSuccess(): Observable<boolean> {
        return this.getUpdatePlatformResponse().pipe(
            map(res => res.result)
        );
    }

    /**
     * 提示平台添加是否成功
     */
    tipUpdatePlatformResult(keepLive: () => boolean, isAdd = true): Subscription {
        return this.isUpdatePlatformSuccess().pipe(
            takeWhile(keepLive),
            map(success => {
                let label = null;

                this.translate.get(['ADD', 'UPDATE', 'SUCCESS', 'FAIL', 'EXCHANGE_FLAG_REPEATED_ERROR']).subscribe(res => label = res);

                return { operate: isAdd ? label.ADD : label.UPDATE, result: success ? label.SUCCESS : label.FAIL, isSuccess: success, errorReason: label.EXCHANGE_FLAG_REPEATED_ERROR };
            })
        ).subscribe(params => {
            this.translate.get('ADD_EXCHANGE_RESULT_TIP', params).subscribe(info => {
                if (params.isSuccess) {
                    this.tip.messageSuccess(info);
                } else {
                    this.tip.messageError(info + params.errorReason);
                }
            });
        });
    }

    /**
     * 获取当前交易所所属的broker, 根据行情服务器的ip地址进行查找，如果此 ip 地址在 broker 中没有，则可能找不到；
     */
    getPreviousPlatformInfo(): Observable<PreviousPlatformInfo> {
        return this.getPlatformDetail().pipe(
            filter(detail => detail.eid === this.constant.FUTURES_CTP || detail.eid === this.constant.FUTURES_ESUNNY),
            distinctUntilChanged(),
            withLatestFrom(this.publicService.getBrokers()),
            map(([platform, brokers]) => {
                const { access_key } = platform;

                const access = JSON.parse(access_key) as PlatformAccessKey;

                // !只能这么凑合了, 没有提供准确的信息来找回之前的设置。服务器信息可能重复。
                const brokerIndex = brokers.findIndex(item => {
                    const quotaServers = flattenDeep(item.groups.map(group => group.nets.map(net => net.quote)));

                    return quotaServers.includes(access.MDFront);
                });

                const broker = brokers[brokerIndex];

                const { MDFront, TDFront } = access;

                let regionIndex = 0;

                let providerIndex = 0;

                for (let groupIdx = 0, len = broker.groups.length; groupIdx < len; groupIdx += 1) {
                    const { nets } = broker.groups[groupIdx];

                    const netIdx = nets.findIndex(net => net.quote.includes(MDFront) && net.trade.includes(TDFront));

                    if (netIdx !== -1) {
                        providerIndex = netIdx;

                        regionIndex = groupIdx;

                        break;
                    }
                }

                return { brokerId: broker.brokerId, regionIndex, providerIndex, quotaServer: MDFront, tradeServer: TDFront, brokerIndex };
            })
        );
    }

    //  =======================================================Local state change=======================================================

    /**
     * @ignore
     */
    resetState(): void {
        this.store.dispatch(new ResetStateAction());
    }

    //  =======================================================Error Handle=======================================================

    /**
     * @ignore
     */
    handlePlatformListError(): Subscription {
        return this.error.handleResponseError(this.getPlatformListResponse());
    }

    /**
     * @ignore
     */
    handleDeletePlatformError(): Subscription {
        return this.error.handleResponseError(this.getDeletePlatformResponse());
    }

    /**
     * @ignore
     */
    handlePlatformDetailError(): Subscription {
        return this.error.handleResponseError(this.getPlatformDetailResponse());
    }

    /**
     * @ignore
     */
    handleUpdatePlatformError(): Subscription {
        return this.error.handleResponseError(this.getUpdatePlatformResponse());
    }
}
