import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CommunityModule } from './../community/community.module';
import { ControlModule } from './../control/control.module';
import { DocumentModule } from './../document/document.module';
import { FactModule } from './../fact/fact.module';
import { SharedModule } from './../shared/shared.module';
import { SquareModule } from './../square/square.module';
import { routing } from './dashboard.routing';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        ControlModule,
        SquareModule,
        DocumentModule,
        FactModule,
        CommunityModule,
        routing,
    ],
    declarations: [DashboardComponent]
})
export class DashboardModule { }
