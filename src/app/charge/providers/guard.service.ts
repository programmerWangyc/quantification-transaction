import { Injectable } from '@angular/core';

import { BaseGuard } from '../../base/guard.service';
import { TipService } from '../../providers/tip.service';
import { StrategyBaseGuard } from '../../strategy/providers/guard.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/index.reducer';
import { Router } from '@angular/router';
import { RoutingService } from '../../providers/routing.service';

@Injectable()
export class ChargeGuard extends BaseGuard {
    constructor(
        public tip: TipService,
        public routing: RoutingService,
    ) {
        super(tip, routing);
    }
}

@Injectable()
export class StrategyGuard extends StrategyBaseGuard {
    constructor(
        public store: Store<AppState>,
        public router: Router,
        public tip: TipService,
        public routing: RoutingService,
    ) {
        super(store, router, tip, routing);
    }
}
