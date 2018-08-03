import { Component, Input, OnInit } from '@angular/core';

import { merge, Observable } from 'rxjs';
import { map, mapTo, startWith } from 'rxjs/operators';

import { ChargeService } from '../providers/charge.service';

@Component({
    selector: 'app-payment-indicator',
    templateUrl: './payment-indicator.component.html',
    styleUrls: ['./payment-indicator.component.scss'],
})
export class PaymentIndicatorComponent implements OnInit {

    /**
     * 标识支付正在进行中的流
     */
    @Input() processing: Observable<any>;

    /**
     * 标识支付开始的流
     */
    @Input() start: Observable<any>;

    /**
     * 是否已选择了支付方式
     */
    @Input() payMethodState: Observable<string>;

    /**
     * 需要用户输入的数据名称
     */
    @Input() inputText = 'INPUT_AMOUNT';

    /**
     * 组件标题
     */
    @Input() title = 'CHARGE_STEP';

    /**
     * 支付进度状态描述
     */
    processState: Observable<string>;

    /**
     * 支付完成状态描述
     */
    completeState: Observable<string>;

    /**
     * 支付进度图标
     */
    paymentStateIcon: Observable<string>;

    constructor(
        private chargeService: ChargeService,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
        this.initialModel();
    }

    /**
     * @ignore
     */
    initialModel() {
        this.processState = this.mapPaymentStateTo('wait', 'process', 'finish');

        this.paymentStateIcon = this.mapPaymentStateTo('anticon-reload', 'anticon-spin anticon-loading', 'anticon-check-circle-o');

        this.completeState = this.chargeService.isRechargeSuccess().pipe(
            startWith(false),
            map(isSuccess => isSuccess ? 'finish' : 'wait')
        );
    }

    /**
     * 将支付状态映射成相应的描述
     */
    private mapPaymentStateTo(start: string, processing: string, finish: string): Observable<string> {
        return merge(
            this.start.pipe(
                mapTo(start),
                startWith(start)
            ),
            this.processing.pipe(
                mapTo(processing)
            ),
            this.chargeService.isRechargeSuccess().pipe(
                mapTo(finish)
            )
        );
    }
}
