import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';

import { combineLatest, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { Path } from '../../app.config';
import { TipService } from '../../providers/tip.service';
import { AppState, selectStrategyListByNameResponse, selectStrategyListResponse } from '../../store/index.reducer';
import { BaseGuard } from '../../base/guard.service';

export class StrategyBaseGuard extends BaseGuard implements CanActivate {
    constructor(
        public store: Store<AppState>,
        public router: Router,
        public tip: TipService,
    ) {
        super(tip);
    }

    /**
     * 是否可以进入当前路由
     */
    canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean> {
        return combineLatest(
            this.store.select(selectStrategyListResponse).pipe(
                map(res => !!res)
            ),
            this.store.select(selectStrategyListByNameResponse).pipe(
                map(res => !!res)
            )
        ).pipe(
            map(([hasList, hasListByName]) => hasList || hasListByName),
            tap(v => !v && this.router.navigate([Path.dashboard, Path.strategy]))
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
