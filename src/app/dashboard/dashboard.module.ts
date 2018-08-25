import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';

import { SharedModule } from '../shared/shared.module';
import { DASHBOARD_EFFECTS } from '../store/index.effect';
import { DashboardComponent } from './dashboard.component';
import { routing } from './dashboard.routing';

@NgModule({
    imports: [
        CommonModule,
        EffectsModule.forFeature(DASHBOARD_EFFECTS),
        SharedModule,
        routing,
    ],
    declarations: [
        DashboardComponent,
    ],
})
export class DashboardModule { }
