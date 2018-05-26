import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { BaseComponent } from '../../base/base.component';
import { PaymentMethod, RechargeFormModal } from '../../interfaces/constant.interface';
import { PAY_METHODS } from '../../providers/constant.service';
import { ChargeService } from '../providers/charge.service';

@Component({
    selector: 'app-charge',
    templateUrl: './charge.component.html',
    styleUrls: ['./charge.component.scss']
})
export class ChargeComponent implements BaseComponent {
    labelSm = 6;

    controlSm = 14;

    xs = 24;

    subscription$$: Subscription;

    form: FormGroup;

    selectedPayMethod = 0;

    payMethods = PAY_METHODS;

    pay$: Subject<RechargeFormModal> = new Subject();

    wechartQRCode: Observable<string>;

    processState: Observable<string>;

    completeState: Observable<string>;

    paymentStateIcon: Observable<string>;

    constructor(
        private fb: FormBuilder,
        private chargeService: ChargeService
    ) {
        this.initForm();
    }

    ngOnInit() {
        this.launch();

        this.initialModel();
    }

    initialModel() {
        this.wechartQRCode = this.chargeService.getWechartQrCode();

        this.processState = this.mapPaymentStateTo('wait', 'process', 'finish');

        this.paymentStateIcon = this.mapPaymentStateTo('anticon-reload', 'anticon-spin anticon-loading', 'anticon-check-circle-o');

        this.completeState = this.chargeService.isRechargeSuccess().startWith(false).map(isSuccess => isSuccess ? 'finish' : 'wait');
    }

    launch() {
        this.subscription$$ = this.chargeService.launchPaymentArg(this.pay$.merge(this.getQRCodeIfWechart()))
            .add(this.chargeService.goToAlipayPage())
            .add(this.chargeService.goToPayPal())
            .add(this.chargeService.handlePaymentsArgsError());
    }

    initForm() {
        this.form = this.fb.group({
            chargeAmount: [3, Validators.required],
            payMethod: '',
        });
    }

    getQRCodeIfWechart(): Observable<RechargeFormModal> {
        return this.form.valueChanges
            .filter((form: RechargeFormModal) => this.chargeAmount.valid && (form.payMethod === PaymentMethod.WECHART))
            .distinctUntilKeyChanged('chargeAmount');
    }

    mapPaymentStateTo(start: string, processing: string, finish: string): Observable<string> {
        return this.processState = this.pay$.merge(this.getQRCodeIfWechart()).map(_ => processing)
            .merge(this.chargeService.isRechargeSuccess().map(_ => finish))
            .merge(this.form.valueChanges.filter((form: RechargeFormModal) => form.payMethod !== PaymentMethod.WECHART).mapTo(start))
            .startWith(start);
    }

    get chargeAmount(): AbstractControl {
        return this.form.get('chargeAmount');
    }

    get payMethod(): AbstractControl {
        return this.form.get('payMethod');
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }
}
