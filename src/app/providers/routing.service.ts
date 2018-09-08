import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { BaseService } from '../base/base.service';
import { RouterInfo } from '../interfaces/app.interface';
import { AppState, selectRouteState } from '../store/index.reducer';
import { Back, Forward, Go } from '../store/router/router.action';
import { RouterStateUrl } from '../store/router/router.reducer';

// const PathMapToBreadcrumb: Map<string, string> = new Map([
//     [Path.account, 'ACCOUNT_MANAGEMENT'],
//     [Path.add, 'ADD'],
//     [Path.agent, 'AGENT'],
//     [Path.auth, 'ACCOUNT_MANAGEMENT'], // 瞎填的
//     [Path.backtest, 'BACKTEST'],
//     [Path.charge, 'ACCOUNT_CHARGE'],
//     [Path.code, 'REGISTER_CODE'],
//     [Path.community, 'COMMUNITY'],
//     [Path.copy, 'COPY'],
//     [Path.dashboard, 'CONTROL_PANEL'],
//     [Path.debug, 'DEBUG'],
//     [Path.doc, 'API_DOCUMENTATION'],
//     [Path.edit, 'EDIT'],
//     [Path.exchange, 'EXCHANGE'],
//     [Path.fact, 'FACT_FINDER'],
//     [Path.google, 'GOOGLE_VERIFY'],
//     [Path.home, 'HOME'],
//     [Path.key, 'API_KEY'],
//     [Path.login, 'LOGIN'],
//     [Path.message, 'MESSAGE_CENTER'],
//     [Path.nickname, 'MODIFY_NICKNAME'],
//     [Path.rent, 'STRATEGY_RENT'],
//     [Path.reset, 'MODIFY_PWD'],
//     [Path.robot, 'ROBOT'],
//     [Path.signup, 'SIGNUP'],
//     [Path.simulation, 'FIRMWARE_SIMULATION'],
//     [Path.square, 'STRATEGY_SQUARE'],
//     [Path.strategy, 'STRATEGY'],
//     [Path.usergroup, 'SUBACCOUNT_GROUP'],
//     [Path.verify, 'VERIFY_CODE'],
//     [Path.warn, 'BALANCE_EARLY_WARNING'],
//     [Path.wechat, 'BIND_WECHAT'],
// ]);


@Injectable()
export class RoutingService extends BaseService {

    constructor(
        private store: Store<AppState>
    ) {
        super();
    }

    /**
     * @ignore
     */
    getCurrentRouteState(): Observable<RouterStateUrl> {
        return this.store.pipe(
            this.selectTruth(selectRouteState)
        );
    }

    /**
     * @ignore
     */
    getCurrentUrl(): Observable<string> {
        return this.getCurrentRouteState().pipe(
            map(state => state.url),
            distinctUntilChanged()
        );
    }

    is404Page(): Observable<boolean> {
        return this.getCurrentRouteState().pipe(
            map(state => state.routeConfig.path === '**')
        );
    }

    // getBreadcrumb(extra?: (data: { [key: string]: any }) => Breadcrumb[]): Observable<Breadcrumb[]> {
    //     return this.getCurrentRouteState().pipe(
    //         map(({ url, params }) => {
    //             const options: string[] = Object.values(params);

    //             let urlWithoutPath = url;

    //             let extraBreadcrumb = [];

    //             if (options.length) {
    //                 urlWithoutPath = options.reduce((acc, cur) => acc.replace('/' + cur, ''), url);

    //                 if (extra) {
    //                     extraBreadcrumb = extra(params);
    //                 }
    //             }

    //             let result = urlWithoutPath.split('/').filter(item => !!item && !!item.length);

    //             result = result.includes(Path.dashboard) && result.length > 1 ? result.slice(1) : result;

    //             const lastIndex = result.length - 1;

    //             return result.map((item, index) => {
    //                 if (index === lastIndex) {
    //                     return { name: PathMapToBreadcrumb.get(item) };
    //                 } else {
    //                     return { name: PathMapToBreadcrumb.get(item), path: '/' + result.slice(0, index + 1).join('/') };
    //                 }
    //             }).concat(extraBreadcrumb);

    //         })
    //     );
    // }

    /**
     * @ignore
     */
    go(data: RouterInfo): void {
        this.store.dispatch(new Go(data));
    }

    /**
     * @ignore
     */
    back(): void {
        this.store.dispatch(new Back());
    }

    /**
     * @ignore
     */
    forward(): void {
        this.store.dispatch(new Forward());
    }

}
