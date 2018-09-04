import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { SelectivePreloadingStrategyService } from './providers/selective.preloading.strategy';
import { AboutComponent } from './home/about/about.component';

const appRoutes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'square', loadChildren: './square/square.module#SquareModule', data: { preload: true } },
    { path: 'fact', loadChildren: './fact/fact.module#FactModule', data: { preload: true } },
    { path: 'community', loadChildren: './community/community.module#CommunityModule', data: { preload: true } },
    { path: 'doc', loadChildren: './document/document.module#DocumentModule', data: { preload: true } },
    { path: 'auth', loadChildren: './auth/auth.module#AuthModule', data: { preload: true } },
    { path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule', data: { preload: true } },
    { path: 'about', component: AboutComponent },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: '**', component: HomeComponent },
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forRoot(
            appRoutes,
            {
                // enableTracing: true,
                preloadingStrategy: SelectivePreloadingStrategyService,
            } // for debugging purpose;
        ),
    ],
    exports: [
        RouterModule,
    ],
    providers: [
        SelectivePreloadingStrategyService,
    ],
})
export class AppRoutingModule { }
