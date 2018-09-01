import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { BaseGuard } from '../../base/guard.service';
import { TipService } from '../../providers/tip.service';
import { AppState } from '../../store/index.reducer';
import { StrategyBaseGuard } from '../../strategy/providers/guard.service';

@Injectable()
export class ChargeGuard extends BaseGuard {
    constructor(
        public tip: TipService,
    ) {
        super(tip);
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
