import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';

const appRoutes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'square', loadChildren: './square/square.module#SquareModule' },
    { path: 'fact', loadChildren: './fact/fact.module#FactModule' },
    { path: 'community', loadChildren: './community/community.module#CommunityModule' },
    { path: 'doc', loadChildren: './document/document.module#DocumentModule' },
    { path: 'auth', loadChildren: './auth/auth.module#AuthModule' },
    { path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule', data: { preload: true } },
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
                preloadingStrategy: PreloadAllModules,
            } // for debugging purpose;
        ),
    ],
    exports: [
        RouterModule,
    ],
})
export class AppRoutingModule { }
