import { Injectable } from '@angular/core';
import { BaseService } from '../base/base.service';
import { Store } from '@ngrx/store';
import { AppState, selectRouteState } from '../store/index.reducer';
import { Back, Forward, Go } from '../store/router/router.action';
import { RouterInfo } from '../interfaces/constant.interface';
import { Observable } from 'rxjs/Observable';
import { RouterStateUrl } from '../store/router/router.reducer';

@Injectable()
export class RoutingService extends BaseService {

    constructor(private store: Store<AppState>) {
        super();
    }

    getCurrentRouteState(): Observable<RouterStateUrl> {
        return this.store.select(selectRouteState);
    }

    getCurrentUrl(): Observable<string> {
        return this.getCurrentRouteState().map(state => state.url);
    }

    go(data: RouterInfo): void {
        this.store.dispatch(new Go(data));
    }

    back(): void {
        this.store.dispatch(new Back());
    }

    forward(): void {
        this.store.dispatch(new Forward());
    }

}
