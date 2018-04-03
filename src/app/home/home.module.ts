import { EffectsModule } from '@ngrx/effects';
import { HomeEffect } from './../store/home/home.effect';
import { StoreModule } from '@ngrx/store';
import { HomeService } from './providers/home.service';
import { SharedModule } from './../shared/shared.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ContainerComponent } from './container/container.component';
import { IntroComponent } from './intro/intro.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        EffectsModule.forFeature([HomeEffect]),
    ],
    declarations: [
        IntroComponent,
        ContainerComponent,
    ],
    providers: [
        HomeService,
    ]
})
export class HomeModule { }
