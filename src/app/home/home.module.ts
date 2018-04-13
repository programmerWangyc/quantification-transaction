import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';

import { SharedModule } from './../shared/shared.module';
import { HomeEffect } from './../store/home/home.effect';
import { ToolModule } from './../tool/tool.module';
import { ContactComponent } from './contact/contact.component';
import { ContainerComponent } from './container/container.component';
import { DetailComponent } from './detail/detail.component';
import { EntranceComponent } from './entrance/entrance.component';
import { FeatureComponent } from './feature/feature.component';
import { IntroComponent } from './intro/intro.component';
import { ProduceUsersComponent } from './produce-users/produce-users.component';
import { HomeService } from './providers/home.service';
import { SundryComponent } from './sundry/sundry.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        EffectsModule.forFeature([HomeEffect]),
        ToolModule,
    ],
    declarations: [
        IntroComponent,
        ContainerComponent,
        FeatureComponent,
        DetailComponent,
        EntranceComponent,
        ProduceUsersComponent,
        ContactComponent,
        SundryComponent,
    ],
    providers: [
        HomeService,
    ]
})
export class HomeModule { }