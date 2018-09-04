import { Params, RouterStateSnapshot, Route } from '@angular/router';
import { routerReducer, RouterReducerState, RouterStateSerializer } from '@ngrx/router-store';
import { ActionReducerMap } from '@ngrx/store';

export interface RouterStateUrl {
    url: string;
    params: Params;
    queryParams: Params;
    routeConfig: Route;
}

export interface State {
    router: RouterReducerState<RouterStateUrl>;
}

export class CustomSerializer implements RouterStateSerializer<RouterStateUrl> {
    serialize(routerState: RouterStateSnapshot): RouterStateUrl {
        let route = routerState.root;

        while (route.firstChild) {
            route = route.firstChild;
        }

        const { url, root: { queryParams } } = routerState;
        const { params, routeConfig } = route;

        return { url, params, queryParams, routeConfig };
    }
}

export const reducers: ActionReducerMap<State> = {
    router: routerReducer,
};

export const getRouteState = (state: State) => state.router.state;
