import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { MemoizedSelector, select, Store } from '@ngrx/store';

import { combineLatest, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { Path } from '../../app.config';
import { BaseGuard } from '../../base/guard.service';
import { TipService } from '../../providers/tip.service';
import { AppState, selectStrategyListByNameResponse, selectStrategyListResponse } from '../../store/index.reducer';

export class StrategyBaseGuard extends BaseGuard implements CanActivate {
    constructor(
        public store: Store<AppState>,
        public router: Router,
        public tip: TipService,
    ) {
        super(tip);
    }

    canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean> {
        return combineLatest(
            this.hasResponse(selectStrategyListResponse),
            this.hasResponse(selectStrategyListByNameResponse)
        ).pipe(
            map(([hasList, hasListByName]) => hasList || hasListByName),
            tap(v => !v && this.router.navigate([Path.dashboard, Path.strategy]))
        );
    }

    private hasResponse<T>(selector: MemoizedSelector<AppState, T>): Observable<boolean> {
        return this.store.pipe(
            select(selector),
            map(res => !!res)
        );
    }
}

@Injectable()
export class StrategyGuard extends StrategyBaseGuard {
    constructor(
        public store: Store<AppState>,
        public router: Router,
        public tip: TipService,
    ) {
        super(store, router, tip);
    }
}
