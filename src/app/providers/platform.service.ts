import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { from as observableFrom, Observable, Subscription } from 'rxjs';
import { groupBy, map, mergeMap } from 'rxjs/operators';

import { GetPlatformListResponse, Platform } from '../interfaces/response.interface';
import * as fromRoot from '../store/index.reducer';
import { AppState } from './../store/index.reducer';
import { ErrorService } from './error.service';
import { ProcessService } from './process.service';


export interface GroupPlatform extends Platform {
    group: string;
}

export interface GroupedPlatform {
    group: string;
    platforms: GroupPlatform[];
}

@Injectable()
export class PlatformService {

    constructor(
        private store: Store<AppState>,
        private error: ErrorService,
        private process: ProcessService,
    ) { }

    /* =======================================================Serve Request======================================================= */

    launchGetPlatformList(data: Observable<any>): Subscription {
        return this.process.processGetPlatformList(data);
    }

    /* =======================================================Date Acquisition======================================================= */

    private getPlatformListResponse(): Observable<GetPlatformListResponse> {
        return this.store.select(fromRoot.selectPlatformListResponse)
            .filter(res => !!res);
    }

    getPlatformList(): Observable<Platform[]> {
        return this.getPlatformListResponse().pipe(
            map(res => res.result.platforms));
    }

    groupPlatformList(): Observable<GroupedPlatform[]> {
        return this.getPlatformList().pipe(
            mergeMap(list => observableFrom(list).pipe(map(platform => {
                if (platform.eid === 'Futures_CTP') {
                    platform['group'] = 'ctp';
                } else if (platform.eid === 'Futures_LTS') {
                    platform['group'] = 'lts';
                } else {
                    platform['group'] = 'botvs';
                }
                return <GroupPlatform>platform;
            }))),
            groupBy(item => item.group),
            mergeMap(obs => obs.reduce((acc, cur) => {
                const { group } = cur;

                const platforms = [...acc.platforms, cur];

                return { group, platforms };

            }, { group: '', platforms: [] })), )
            .reduce((acc, cur) => [...acc, cur], [])
            .do(v => console.log(v));
    }

    /* =======================================================Error Handle======================================================= */

    handlePlatformListError(): Subscription {
        return this.error.handleResponseError(this.getPlatformListResponse());
    }
}
