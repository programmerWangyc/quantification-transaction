import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EffectsModule } from '@ngrx/effects';

import { SharedModule } from './../shared/shared.module';
import { HomeEffect } from './../store/home/home.effect';
import { ToolModule } from './../tool/tool.module';
import { ContainerComponent } from './container/container.component';
import { DetailComponent, DetailContainerComponent } from './detail/detail.component';
import { EntranceComponent, EntranceContainerComponent } from './entrance/entrance.component';
import { FeatureComponent, FeatureContainerComponent } from './feature/feature.component';
import { IntroComponent } from './intro/intro.component';
import { HomeService } from './providers/home.service';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        EffectsModule.forFeature([HomeEffect]),
        NgbModule,
        ToolModule,
    ],
    declarations: [
        IntroComponent,
        ContainerComponent,
        FeatureComponent,
        FeatureContainerComponent,
        DetailComponent,
        DetailContainerComponent,
        EntranceComponent,
        EntranceContainerComponent,
    ],
    providers: [
        HomeService,
    ]
})
export class HomeModule { }