import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base/base.service';
import { RouterInfo } from '../interfaces/app.interface';
import { AppState, selectRouteState } from '../store/index.reducer';
import { Back, Forward, Go } from '../store/router/router.action';
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
        return this.getCurrentRouteState()
            .pipe(
                map(state => state.url)
            );
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
