import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { ContainerComponent } from './container/container.component';
import { SquareRoutingModule } from './square.routing.module';
import { SquareComponent } from './square/square.component';
import { StrategyTypeComponent } from './strategy-type/strategy-type.component';

// const squareRoutes: Routes = [
//     { path: '', component: ContainerComponent }
// ];

@NgModule({
    imports: [
        CommonModule,
        SquareRoutingModule,
        SharedModule,
    ],
    declarations: [StrategyTypeComponent, SquareComponent, ContainerComponent]
})
export class SquareModule { }
