import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ContainerComponent as HomeContainer } from './home/container/container.component';

const appRoutes: Routes = [
    { path: 'home', component: HomeContainer },
    { path: 'square', loadChildren: 'app/square/square.module#SquareModule' },
    { path: 'fact', loadChildren: './fact/fact.module#FactModule' },
    { path: 'community', loadChildren: './community/community.module#CommunityModule' },
    { path: 'doc', loadChildren: './document/document.module#DocumentModule' },
    { path: 'management', loadChildren: './management/management.module#ManagementModule', canLoad: [] },
    { path: 'control', loadChildren: './control/control.module#ControlModule', canLoad: [] },
    { path: 'auth', loadChildren: './auth/auth.module#AuthModule' },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '**', component: HomeContainer },  // 404页面
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forRoot(
            appRoutes,
            // {
                // enableTracing: true,

            // } // for debugging purpose;
        ),
    ],
    declarations: [],
    exports: [
        RouterModule,
    ],
})
export class AppRoutingModule { }
