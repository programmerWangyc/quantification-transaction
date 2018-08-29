import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from '@angular/router';

import { from, of } from 'rxjs';
import { find, map, mergeMap } from 'rxjs/operators';

import { DeactivateGuard } from '../interfaces/app.interface';
import { TipService } from '../providers/tip.service';

export interface CanDeactivateComponent {
    canDeactivate(): DeactivateGuard[];
}

export class BaseGuard implements CanDeactivate<CanDeactivateComponent> {
    constructor(
        public tip: TipService,
    ) { }

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
            mergeMap(item => !item ? of(true) : this.tip.guardRiskOperate(item.message))
        );
    }
}
