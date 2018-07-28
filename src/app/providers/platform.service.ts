import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';

import { from as observableFrom, Observable, Subscription } from 'rxjs';
import { groupBy, map, mergeMap, reduce, switchMap, mapTo } from 'rxjs/operators';

import { BaseService } from '../base/base.service';
import { GetPlatformListResponse, Platform, DeletePlatformResponse, GetPlatformDetailResponse, PlatformDetail, SavePlatformResponse } from '../interfaces/response.interface';
import * as fromRoot from '../store/index.reducer';
import { ErrorService } from './error.service';
import { ProcessService } from './process.service';
import { UtilService } from './util.service';
import { GetPlatformDetailRequest, SavePlatformRequest } from '../interfaces/request.interface';

export interface GroupPlatform extends Platform {
    group: string;
}

export interface GroupedPlatform {
    group: string;
    platforms: GroupPlatform[];
}

@Injectable()
export class PlatformService extends BaseService {

    constructor(
        private store: Store<fromRoot.AppState>,
        private error: ErrorService,
        private process: ProcessService,
        private util: UtilService,
    ) {
        super();
    }

    //  =======================================================Serve Request=======================================================

    /**
     * 请求 platform list;
     * @param data command to request platform list;
     * @param allowSeparateRequest 是否允单独发起请求
     */
    launchGetPlatformList(data: Observable<any>): Subscription {
        return this.process.processGetPlatformList(data);
    }

    /**
     * 删除 platform
     */
    launchDeletePlatform(platformObs: Observable<Platform>): Subscription {
        return this.process.processDeletePlatform(platformObs.pipe(
            switchMap(platform => this.util.guardRiskOperate('DELETE_EXCHANGE_TIP', { name: platform.name }).pipe(
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
            )
            ),
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
    isUpdatePlatformSuccess(): Observable<boolean> {
        return this.getUpdatePlatformResponse().pipe(
            map(res => res.result)
        );
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
