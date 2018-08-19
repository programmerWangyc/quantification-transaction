import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { RouterStateSerializer, StoreRouterConnectingModule } from '@ngrx/router-store';

import { SharedModule } from '../shared/shared.module';
import { DASHBOARD_EFFECTS } from '../store/index.effect';
import { CustomSerializer } from '../store/router/router.reducer';
import { DashboardComponent } from './dashboard.component';
import { routing } from './dashboard.routing';

@NgModule({
    imports: [
        CommonModule,
        EffectsModule.forFeature(DASHBOARD_EFFECTS),
        SharedModule,
        StoreRouterConnectingModule,
        routing,
    ],
    declarations: [
        DashboardComponent,
    ],
    providers: [
        { provide: RouterStateSerializer, useClass: CustomSerializer },
    ],
})
export class DashboardModule { }
