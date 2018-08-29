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

import { DIRECTIVES } from './directives/directives.import';
import { ExchangePairComponent } from './exchange-pair/exchange-pair.component';
import { FooterComponent } from './footer/footer.component';
import { IndicatorComponent } from './indicator/indicator.component';
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
import { CustomSnackBarComponent } from './tool.components';
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
        CustomSnackBarComponent,
        DIRECTIVES,
        ExchangePairComponent,
        FooterComponent,
        IndicatorComponent,
        NavbarComponent,
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
        CustomSnackBarComponent,
        SimpleNzConfirmWrapComponent,
        StrategyRenewalComponent,
        VerifyPasswordComponent,
    ],
    exports: [
        DIRECTIVES,
        ExchangePairComponent,
        FooterComponent,
        IndicatorComponent,
        NavbarComponent,
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
