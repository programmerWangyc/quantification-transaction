import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';

import { SharedModule } from '../shared/shared.module';
import { HomeEffect } from '../store/home/home.effect';
import { ToolModule } from '../tool/tool.module';
import { ContactComponent } from './contact/contact.component';
import { DetailComponent } from './detail/detail.component';
import { EntranceComponent } from './entrance/entrance.component';
import { FeatureComponent } from './feature/feature.component';
import { HomeComponent } from './home.component';
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
        ContactComponent,
        DetailComponent,
        EntranceComponent,
        FeatureComponent,
        HomeComponent,
        IntroComponent,
        ProduceUsersComponent,
        SundryComponent,
    ],
    providers: [
        HomeService,
    ]
})
export class HomeModule { }