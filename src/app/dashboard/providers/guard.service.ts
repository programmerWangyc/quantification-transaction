import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate, Router, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';

import { combineLatest, from, Observable, of } from 'rxjs';
import { find, map, mergeMap, tap } from 'rxjs/operators';

import { Path } from '../../app.config';
import { TipService } from '../../providers/tip.service';
import { AppState, selectStrategyListByNameResponse, selectStrategyListResponse } from '../../store/index.reducer';
import { ConfirmComponent } from '../../tool/confirm/confirm.component';
import { DeactivateGuard } from '../dashboard.interface';

export interface CanDeactivateComponent {
    canDeactivate(): DeactivateGuard[];
}

export class BaseGuard implements CanDeactivate<CanDeactivateComponent> {
    constructor(
        public tip: TipService,
    ) {

    }

    /**
     * 是否可以退出当前路由。
     * !FIXME:守卫上有一个bug，被拦截后点取消时，侧边栏没有恢复
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

@Injectable()
export class StrategyGuard extends BaseGuard implements CanActivate {
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
export class ChargeGuard extends BaseGuard {
    constructor(
        public tip: TipService
    ) {
        super(tip);
    }
}
