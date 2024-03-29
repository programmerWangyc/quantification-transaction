import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';
import { ContactComponent } from './contact/contact.component';
import { DetailComponent } from './detail/detail.component';
import { EntranceComponent } from './entrance/entrance.component';
import { FeatureComponent } from './feature/feature.component';
import { HomeComponent } from './home.component';
import { IntroComponent } from './intro/intro.component';
import { ProduceUsersComponent } from './produce-users/produce-users.component';
import { SundryComponent } from './sundry/sundry.component';
import { AboutComponent } from './about/about.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RouterModule,
    ],
    declarations: [
        AboutComponent,
        ContactComponent,
        DetailComponent,
        EntranceComponent,
        FeatureComponent,
        HomeComponent,
        IntroComponent,
        ProduceUsersComponent,
        SundryComponent,
    ],
})
export class HomeModule { }
