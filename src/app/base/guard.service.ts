import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from '@angular/router';

import { from, of } from 'rxjs';
import { find, map, mergeMap } from 'rxjs/operators';

import { DeactivateGuard } from '../interfaces/app.interface';
import { TipService } from '../providers/tip.service';
import { BaseService } from './base.service';

export interface CanDeactivateComponent {
    canDeactivate(): DeactivateGuard[];
}

export class BaseGuard extends BaseService implements CanDeactivate<CanDeactivateComponent> {
    constructor(
        public tip: TipService,
    ) {
        super();
    }

    canDeactivate(component: CanDeactivateComponent, _route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) {
        const guards = component.canDeactivate();

        return from(guards).pipe(
            mergeMap(guard => guard.canDeactivate.pipe(
                map(can => ({ can, message: guard.message }))
            )),
            find(guard => !guard.can),
            mergeMap(item => !item ? of(true) : this.tip.guardRiskOperate(item.message, null, null, false))
        );
    }
}
