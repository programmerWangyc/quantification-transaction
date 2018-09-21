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

    getCurrentRouteState(): Observable<RouterStateUrl> {
        return this.store.pipe(
            this.selectTruth(selectRouteState)
        );
    }

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

    go(data: RouterInfo): void {
        this.store.dispatch(new Go(data));
    }


    back(): void {
        this.store.dispatch(new Back());
    }

    forward(): void {
        this.store.dispatch(new Forward());
    }

}
