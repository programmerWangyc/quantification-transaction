import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { select, Store } from '@ngrx/store';

import { Observable, of } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';

import { Path } from '../app.config';
import { AppState, selectRouteState } from '../store/index.reducer';
import { uniq } from 'lodash';

interface PreloadedWatchedModules {
    watchPath: string;
    preloadedModules: string[];
}

@Injectable()
export class SelectivePreloadingStrategyService implements PreloadingStrategy {
    preloadedModules: string[] = [];

    preloadedWatchedModules: PreloadedWatchedModules[] = [
        { watchPath: Path.auth, preloadedModules: [Path.robot, Path.strategy] },
        { watchPath: Path.robot, preloadedModules: [Path.strategy] },
    ];

    constructor(
        private store: Store<AppState>
    ) { }

    preload(route: Route, load: () => Observable<any>): Observable<any> {
        if (route.data && route.data['preload']) {
            this.preloadedModules.push(route.path);

            return load();
        } else {
            return this.store.pipe(
                select(selectRouteState),
                take(1),
                mergeMap(({ url }) => {
                    const preloadedModules = this.preloadedWatchedModules.filter(item => url.includes(item.watchPath)).map(item => item.preloadedModules);

                    if (!!preloadedModules.length) {
                        this.preloadedModules = uniq([...this.preloadedModules, ...preloadedModules.reduce((acc, cur) => [...acc, ...cur], [])]);

                        return load();
                    } else {
                        return of(null);
                    }
                })
            );
        }
    }
}
