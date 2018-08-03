import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { RouterStateSerializer, StoreRouterConnectingModule } from '@ngrx/router-store';

import { AgentModule } from '../agent/agent.module';
import { BacktestModule } from '../backtest/backtest.module';
import { ChargeModule } from '../charge/charge.module';
import { RobotModule } from '../robot/robot.module';
import { SharedModule } from '../shared/shared.module';
import { DASHBOARD_EFFECTS } from '../store/index.effect';
import { CustomSerializer } from '../store/router/router.reducer';
import { StrategyModule } from '../strategy/strategy.module';
import { ToolModule } from '../tool/tool.module';
import { AgentAddComponent } from './agent-add/agent-add.component';
import { AgentComponent } from './agent/agent.component';
import { CommunityComponent } from './community/community.component';
import { DashboardComponent } from './dashboard.component';
import { routing } from './dashboard.routing';
import { DocComponent } from './doc/doc.component';
import { FactComponent } from './fact/fact.component';
import { StrategyGuard, RobotGuard } from './providers/guard.service';
import { RechargeComponent } from './recharge/recharge.component';
import { RobotCreationComponent } from './robot-creation/robot-creation.component';
import { RobotDebugComponent } from './robot-debug/robot-debug.component';
import { RobotDetailComponent } from './robot-detail/robot-detail.component';
import { RobotComponent } from './robot/robot.component';
import { SquareComponent } from './square/square.component';
import { StrategyAddComponent } from './strategy-add/strategy-add.component';
import { StrategyCopyComponent } from './strategy-copy/strategy-copy.component';
import { StrategyCreateMetaComponent } from './strategy-create-meta/strategy-create-meta.component';
import { StrategyEditComponent } from './strategy-edit/strategy-edit.component';
import { StrategyRentComponent } from './strategy-rent/strategy-rent.component';
import { StrategyVerifyCodeComponent } from './strategy-verify-code/strategy-verify-code.component';
import { StrategyComponent } from './strategy/strategy.component';
import { ExchangeModule } from '../exchange/exchange.module';
import { ExchangeComponent } from './exchange/exchange.component';
import { ExchangeAddComponent } from './exchange-add/exchange-add.component';
import { ExchangeEditComponent } from './exchange-edit/exchange-edit.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RobotModule,
        routing,
        EffectsModule.forFeature(DASHBOARD_EFFECTS),
        ToolModule,
        ChargeModule,
        StrategyModule,
        StoreRouterConnectingModule,
        BacktestModule,
        AgentModule,
        ExchangeModule,
    ],
    declarations: [
        DashboardComponent,
        SquareComponent,
        CommunityComponent,
        DocComponent,
        FactComponent,
        RobotDetailComponent,
        RobotComponent,
        RobotCreationComponent,
        RechargeComponent,
        RobotDebugComponent,
        StrategyComponent,
        StrategyVerifyCodeComponent,
        StrategyRentComponent,
        StrategyCopyComponent,
        StrategyEditComponent,
        StrategyCreateMetaComponent,
        StrategyAddComponent,
        AgentComponent,
        AgentAddComponent,
        ExchangeComponent,
        ExchangeAddComponent,
        ExchangeEditComponent,
    ],
    providers: [
        { provide: RouterStateSerializer, useClass: CustomSerializer },
        StrategyGuard,
        RobotGuard,
    ],
})
export class DashboardModule { }
