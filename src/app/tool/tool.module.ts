import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatSnackBarModule } from '@angular/material';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { ChartModule } from 'angular2-highcharts';
import { QRCodeModule } from 'angular2-qrcode';
import { NgZorroAntdModule } from 'ng-zorro-antd';

import { ConfirmComponent } from './confirm/confirm.component';
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
import { CustomSnackBarComponent } from './tool.components';
import { VerifyPasswordComponent } from './verify-password/verify-password.component';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        FormsModule,
        MatDialogModule,
        MatSnackBarModule,
        NgZorroAntdModule,
        QRCodeModule,
        ReactiveFormsModule,
        RouterModule,
        TranslateModule,
        ChartModule.forRoot(
            require('highcharts/highstock'),
            require('../plugins/exporting.js'),
            require('../plugins/offline-exporting.js'),
        ),
    ],
    declarations: [
        ConfirmComponent,
        CustomSnackBarComponent,
        DIRECTIVES,
        ExchangePairComponent,
        FooterComponent,
        IndicatorComponent,
        NavbarComponent,
        PIPES,
        RunningLogComponent,
        ShareComponent,
        SimpleNzConfirmWrapComponent,
        VerifyPasswordComponent,
        RobotInfoComponent,
        RobotInnerTableComponent,
        RobotLogComponent,
        RobotProfitChartComponent,
        RobotStatusComponent,
        RobotStrategyChartComponent,
        RobotSubtitleComponent,
    ],

    entryComponents: [
        ConfirmComponent,
        CustomSnackBarComponent,
        SimpleNzConfirmWrapComponent,
        VerifyPasswordComponent,
    ],
    exports: [
        DIRECTIVES,
        ExchangePairComponent,
        FooterComponent,
        IndicatorComponent,
        NavbarComponent,
        PIPES,
        RunningLogComponent,
        ShareComponent,
        SimpleNzConfirmWrapComponent,
        RobotInfoComponent,
        RobotInnerTableComponent,
        RobotLogComponent,
        RobotProfitChartComponent,
        RobotStatusComponent,
        RobotStrategyChartComponent,
        RobotSubtitleComponent,
    ],
})
export class ToolModule { }
