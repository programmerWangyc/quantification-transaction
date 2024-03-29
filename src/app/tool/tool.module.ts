import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { ChartModule } from 'angular2-highcharts';
import { HighchartsStatic } from 'angular2-highcharts/dist/HighchartsService';
import { QRCodeModule } from 'angular2-qrcode';
import { NgZorroAntdModule } from 'ng-zorro-antd';

import { AvatarComponent } from './avatar/avatar.component';
import { DIRECTIVES } from './directives/directives.import';
import { ExchangePairComponent } from './exchange-pair/exchange-pair.component';
import { FooterComponent } from './footer/footer.component';
import { FourZeroFourComponent } from './four-zero-four/four-zero-four.component';
import { IndicatorComponent } from './indicator/indicator.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { NavbarComponent } from './navbar/navbar.component';
import { PIPES } from './pipes/index.pipe';
import { RobotLogComponent } from './robot-log/robot-log.component';
import { RobotProfitChartComponent } from './robot-profit-chart/robot-profit-chart.component';
import {
    RobotInfoComponent, RobotInnerTableComponent, RobotStatusComponent, RobotSubtitleComponent
} from './robot-status/robot-status.component';
import { RobotStrategyChartComponent } from './robot-strategy-chart/robot-strategy-chart.component';
import { RunningLogComponent } from './running-log/running-log.component';
import { ShareComponent } from './share/share.component';
import { SimpleNzConfirmWrapComponent } from './simple-nz-confirm-wrap/simple-nz-confirm-wrap.component';
import { StrategyRenewalComponent } from './strategy-renewal/strategy-renewal.component';
import { VerifyPasswordComponent } from './verify-password/verify-password.component';

export function highchartsFactory() {
    const highStock = require('highcharts/highstock');
    const highExporting = require('../plugins/exporting.js');

    highExporting(highStock);

    return highStock;
}

@NgModule({
    imports: [
        ChartModule,
        CommonModule,
        FlexLayoutModule,
        FormsModule,
        NgZorroAntdModule,
        QRCodeModule,
        ReactiveFormsModule,
        RouterModule,
        TranslateModule,
    ],
    declarations: [
        AvatarComponent,
        DIRECTIVES,
        ExchangePairComponent,
        FooterComponent,
        FourZeroFourComponent,
        IndicatorComponent,
        NavbarComponent,
        NavMenuComponent,
        PIPES,
        RobotInfoComponent,
        RobotInnerTableComponent,
        RobotLogComponent,
        RobotProfitChartComponent,
        RobotStatusComponent,
        RobotStrategyChartComponent,
        RobotSubtitleComponent,
        RunningLogComponent,
        ShareComponent,
        SimpleNzConfirmWrapComponent,
        StrategyRenewalComponent,
        VerifyPasswordComponent,
    ],
    entryComponents: [
        SimpleNzConfirmWrapComponent,
        StrategyRenewalComponent,
        VerifyPasswordComponent,
    ],
    exports: [
        AvatarComponent,
        DIRECTIVES,
        ExchangePairComponent,
        FooterComponent,
        IndicatorComponent,
        NavbarComponent,
        NavMenuComponent,
        PIPES,
        RobotInfoComponent,
        RobotInnerTableComponent,
        RobotLogComponent,
        RobotProfitChartComponent,
        RobotStatusComponent,
        RobotStrategyChartComponent,
        RobotSubtitleComponent,
        RunningLogComponent,
        ShareComponent,
        SimpleNzConfirmWrapComponent,
        StrategyRenewalComponent,
    ],
    providers: [
        { provide: HighchartsStatic, useFactory: highchartsFactory },
    ],
})
export class ToolModule { }
