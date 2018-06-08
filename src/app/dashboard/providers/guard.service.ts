import { Injectable } from '@angular/core';
import {
    ActivatedRoute,
    ActivatedRouteSnapshot,
    CanActivate,
    CanDeactivate,
    Router,
    RouterStateSnapshot,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { NzModalService } from 'ng-zorro-antd';
import { Observable } from 'rxjs/Observable';

import { Path } from '../../app.config';
import { TipService } from '../../providers/tip.service';
import { AppState, selectStrategyListResponse } from '../../store/index.reducer';
import { ConfirmComponent } from '../../tool/confirm/confirm.component';

export interface CanDeactivateComponent {
    canDeactivate(): Observable<boolean> | boolean | Promise<boolean>
}

@Injectable()
export class StrategyDetailGuard implements CanActivate, CanDeactivate<CanDeactivateComponent> {
    constructor(
        public store: Store<AppState>,
        public router: Router,
        public route: ActivatedRoute,
        public nzModal: NzModalService,
        public tip: TipService,
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.store.select(selectStrategyListResponse)
            .map(res => !!res)
            .do(v => !v && this.router.navigate([Path.dashboard, Path.strategy]));
    }

    canDeactivate(component: CanDeactivateComponent, route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const canDeactivate = component.canDeactivate();

        if (canDeactivate) {
            return true;
        } else {
            //FIXME:  当焦点仍在 codemirror 中时，如果内容改变，切换路由会导致codemirror焦点的检测报错。
            // const modal = this.nzModal.confirm({
            //     nzContent: SimpleNzConfirmWrapComponent,
            //     nzComponentParams: { content: 'DEPRECATE_UNSAVED_CHANGE_CONFIRM' },
            //     nzOnOk: () => modal.close(true),
            //     nzOnCancel: () => modal.close(false),
            // });

            // return modal.afterClose;
            return this.tip.confirmOperateTip(ConfirmComponent, { message: 'DEPRECATE_UNSAVED_CHANGE_CONFIRM', needTranslate: true });
        }
    }
}
