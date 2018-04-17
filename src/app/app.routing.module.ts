import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ContainerComponent as HomeContainer } from './home/container/container.component';

const appRoutes: Routes = [
    { path: 'home', component: HomeContainer }, // 主页
    { path: 'square', loadChildren: 'app/square/square.module#SquareModule' }, // 策略广场
    { path: 'fact', loadChildren: './fact/fact.module#FactModule' }, // 实盘围观 
    { path: 'community', loadChildren: './community/community.module#CommunityModule' }, //交流社区
    { path: 'doc', loadChildren: './document/document.module#DocumentModule' }, // API 文档
    { path: 'management', loadChildren: './management/management.module#ManagementModule', canLoad: [] }, // 宽客工具
    { path: 'auth', loadChildren: './auth/auth.module#AuthModule' }, // 登录、注册、重置密码、修改密码
    { path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule'}, // 控制台
    { path: '', redirectTo: 'home', pathMatch: 'full' }, // 重定向页面
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
