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
import { keepAliveFn } from '../interfaces/app.interface'; export interface GroupPlatform extends Platform {
    group: string;
}export interface GroupedPlatform {
    group: string;
    platforms: GroupPlatform[];
}export interface SavePlatformInfo {
    operate: string;
    result: string;
    isSuccess: boolean;
    errorReason: string;
}export interface PreviousPlatformInfo {
    regionIndex: number;
    providerIndex: number;
    quotaServer: string;
    tradeServer: string;
    brokerId: string;
    brokerIndex: number;
}@Injectable()
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
    } launchGetPlatformList(data: Observable<any>): Subscription {
        return this.process.processGetPlatformList(data);
    }
    launchDeletePlatform(platformObs: Observable<Platform>): Subscription {
        return this.process.processDeletePlatform(platformObs.pipe(
            switchMap(platform => this.tip.guardRiskOperate('DELETE_EXCHANGE_TIP', { name: platform.name }).pipe(
                mapTo({ id: platform.id })
            ))
        ));
    }
    launchGetPlatformDetail(idObs: Observable<GetPlatformDetailRequest>): Subscription {
        return this.process.processGetPlatformDetail(idObs);
    }
    launchUpdatePlatform(paramsObs: Observable<SavePlatformRequest>): Subscription {
        return this.process.processUpdatePlatform(paramsObs);
    }
    private getPlatformListResponse(): Observable<GetPlatformListResponse> {
        return this.store.select(fromRoot.selectPlatformListResponse).pipe(
            this.filterTruth()
        );
    }
    getPlatformList(): Observable<Platform[]> {
        return this.getPlatformListResponse().pipe(
            map(res => res.result.platforms)
        );
    }
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
                    const { group } = cur; const platforms = [...acc.platforms, cur]; return { group, platforms };
                }, { group: '', platforms: [] })
            )),
            reduce((acc, cur) => [...acc, cur], []),
        );
    }
    isPlatformLoading(): Observable<boolean> {
        return this.store.pipe(
            select(fromRoot.selectPlatformIsLoading)
        );
    }
    private getDeletePlatformResponse(): Observable<DeletePlatformResponse> {
        return this.store.pipe(
            select(fromRoot.selectPlatformDeleteResponse),
            this.filterTruth()
        );
    }
    private getPlatformDetailResponse(): Observable<GetPlatformDetailResponse> {
        return this.store.pipe(
            select(fromRoot.selectPlatformDetailResponse),
            this.filterTruth()
        );
    }
    getPlatformDetail(): Observable<PlatformDetail> {
        return this.getPlatformDetailResponse().pipe(
            map(res => res.result.platform)
        );
    }
    private getUpdatePlatformResponse(): Observable<SavePlatformResponse> {
        return this.store.pipe(
            select(fromRoot.selectPlatformUpdateResponse),
            this.filterTruth()
        );
    }
    private isUpdatePlatformSuccess(): Observable<boolean> {
        return this.getUpdatePlatformResponse().pipe(
            map(res => res.result)
        );
    }
    tipUpdatePlatformResult(keepLive: () => boolean, isAdd = true): Subscription {
        return this.isUpdatePlatformSuccess().pipe(
            takeWhile(keepLive),
            map(success => {
                let label = null; this.translate.get(['ADD', 'UPDATE', 'SUCCESS', 'FAIL', 'EXCHANGE_FLAG_REPEATED_ERROR']).subscribe(res => label = res); return { operate: isAdd ? label.ADD : label.UPDATE, result: success ? label.SUCCESS : label.FAIL, isSuccess: success, errorReason: label.EXCHANGE_FLAG_REPEATED_ERROR };
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
    getPreviousPlatformInfo(): Observable<PreviousPlatformInfo> {
        return this.getPlatformDetail().pipe(
            filter(detail => detail.eid === this.constant.FUTURES_CTP || detail.eid === this.constant.FUTURES_ESUNNY),
            distinctUntilChanged(),
            withLatestFrom(this.publicService.getBrokers()),
            map(([platform, brokers]) => {
                const { access_key } = platform; const access = JSON.parse(access_key) as PlatformAccessKey;
                const brokerIndex = brokers.findIndex(item => {
                    const quotaServers = flattenDeep(item.groups.map(group => group.nets.map(net => net.quote))); return quotaServers.includes(access.MDFront);
                }); const broker = brokers[brokerIndex]; const { MDFront, TDFront } = access; let regionIndex = 0; let providerIndex = 0; for (let groupIdx = 0, len = broker.groups.length; groupIdx < len; groupIdx += 1) {
                    const { nets } = broker.groups[groupIdx]; const netIdx = nets.findIndex(net => net.quote.includes(MDFront) && net.trade.includes(TDFront)); if (netIdx !== -1) {
                        providerIndex = netIdx; regionIndex = groupIdx; break;
                    }
                } return { brokerId: broker.brokerId, regionIndex, providerIndex, quotaServer: MDFront, tradeServer: TDFront, brokerIndex };
            })
        );
    }
    resetState(): void {
        this.store.dispatch(new ResetStateAction());
    }
    handlePlatformListError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getPlatformListResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
    handleDeletePlatformError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getDeletePlatformResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
    handlePlatformDetailError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getPlatformDetailResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
    handleUpdatePlatformError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getUpdatePlatformResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
}
