import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { SimulationService } from './providers/simulation.service';
import { SimulationChartComponent } from './simulation-chart/simulation-chart.component';
import { SimulationOverviewComponent } from './simulation-overview/simulation-overview.component';
import { routing } from './simulation.routing';
import { SimulationComponent } from './simulation/simulation.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        routing,
    ],
    declarations: [
        SimulationComponent,
        SimulationChartComponent,
        SimulationOverviewComponent,
    ],
    providers: [
        SimulationService,
    ],
    exports: [
        SimulationComponent,
    ],
})
export class SimulationModule { }
