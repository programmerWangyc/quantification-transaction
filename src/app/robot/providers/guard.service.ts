import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { BaseGuard } from '../../base/guard.service';
import { TipService } from '../../providers/tip.service';
import { AppState } from '../../store/index.reducer';
import { RoutingService } from '../../providers/routing.service';

export class RobotBaseGuard extends BaseGuard {
    constructor(
        public store: Store<AppState>,
        public router: Router,
        public tip: TipService,
        public routing: RoutingService,
    ) {
        super(tip, routing);
    }

    // canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean> {
    //     return combineLatest(
    //         this.store.select(selectStrategyListResponse).pipe(
    //             map(res => !!res)
    //         ),
    //         this.store.select(selectStrategyListByNameResponse).pipe(
    //             map(res => !!res)
    //         )
    //     ).pipe(
    //         map(([hasList, hasListByName]) => hasList || hasListByName),
    //         tap(v => !v && this.router.navigate([Path.dashboard, Path.strategy]))
    //     );
    // }
}

@Injectable()
export class RobotGuard extends RobotBaseGuard {
    constructor(
        public store: Store<AppState>,
        public router: Router,
        public tip: TipService,
        public routing: RoutingService,
    ) {
        super(store, router, tip, routing);
    }
}
