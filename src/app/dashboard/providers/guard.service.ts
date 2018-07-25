import { Injectable } from '@angular/core';
import {
    ActivatedRoute, ActivatedRouteSnapshot, CanActivate, CanDeactivate, Router, RouterStateSnapshot
} from '@angular/router';
import { Store } from '@ngrx/store';

import { NzModalService } from 'ng-zorro-antd';
import { from, Observable, of } from 'rxjs';
import { find, map, mergeMap, tap } from 'rxjs/operators';

import { Path } from '../../app.config';
import { TipService } from '../../providers/tip.service';
import { AppState, selectStrategyListResponse } from '../../store/index.reducer';
import { ConfirmComponent } from '../../tool/confirm/confirm.component';
import { StrategyDetailDeactivateGuard } from '../dashboard.interface';

export interface CanDeactivateComponent {
    canDeactivate(): StrategyDetailDeactivateGuard[];
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

    canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean> {
        return this.store.select(selectStrategyListResponse)
            .pipe(
                map(res => !!res),
                tap(v => !v && this.router.navigate([Path.dashboard, Path.strategy]))
            );
    }

    /**
     * 是否可以退出当前路由。
     */
    canDeactivate(component: CanDeactivateComponent, _route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) {
        const guards = component.canDeactivate();

        // !FIXME:  当焦点仍在 codemirror 中时，如果内容改变，切换路由会导致codemirror焦点的检测报错。
        // const modal = this.nzModal.confirm({
        //     nzContent: SimpleNzConfirmWrapComponent,
        //     nzComponentParams: { content: 'DEPRECATE_UNSAVED_CHANGE_CONFIRM' },
        //     nzOnOk: () => modal.close(true),
        //     nzOnCancel: () => modal.close(false),
        // });

        return from(guards).pipe(
            mergeMap(guard => guard.canDeactivate.pipe(
                map(can => ({ can, message: guard.message }))
            )),
            find(guard => !guard.can),
            mergeMap(item => !item ? of(true) : this.tip.confirmOperateTip(ConfirmComponent, { message: item.message, needTranslate: true }))
        );
    }
}
