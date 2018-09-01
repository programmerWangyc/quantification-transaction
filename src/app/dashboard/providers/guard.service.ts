import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { PublicService } from '../../providers/public.service';
import { RoutingService } from '../../providers/routing.service';

@Injectable()
export class DashboardGuard implements CanActivate {
    constructor(
        private routing: RoutingService,
        private publicService: PublicService,
    ) {
    }

    canActivate(): Observable<boolean> {
        return this.publicService.isLogin().pipe(
            tap(isLogin => !isLogin && this.routing.go({ path: ['/auth/login'] }))
        );
    }
}
