import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { merge, Observable, Subject, Subscription } from 'rxjs';
import { filter, mapTo, startWith, take, takeWhile } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { PaymentMethod } from '../charge.config';
import { PAY_METHODS } from '../providers/charge.constant.service';
import { ChargeService, RechargeFormModal } from '../providers/charge.service';

export class ChargeBase {

    /**
     * @ignore
     */
    labelSm = 6;

    /**
     * @ignore
     */
    controlSm = 14;

    /**
     * @ignore
     */
    xs = 24;

    /**
     * 支付方式
     */
    payMethods = PAY_METHODS;

    /**
     * 支付处理开始状态中的流
     */
    protected notifyPayStart(control: AbstractControl): Observable<any> {
        return control.valueChanges.pipe(
            filter(method => method !== PaymentMethod.WECHAT),
            startWith(null)
        );
    }

    /**
     * 支付方式选择所处的状态
     */
    protected notifyPayMethodState(control: AbstractControl): Observable<string> {
        return control.valueChanges.pipe(
            take(1),
            mapTo('finish'),
            startWith('wait')
        );
    }
}

@Component({
    selector: 'app-charge',
    templateUrl: './charge.component.html',
    styleUrls: ['./charge.component.scss'],
})
export class ChargeComponent extends ChargeBase implements BaseComponent {

    /**
     * @ignore
     */
    subscription$$: Subscription;

    /**
     * @ignore
     */
    form: FormGroup;

    /**
     * 提交支付
     */
    pay$: Subject<RechargeFormModal> = new Subject();

    /**
     * 微信支付码
     */
    wechatQRCode: Observable<string>;

    /**
     * 标识支付正在进行的流
     */
    processing: Observable<RechargeFormModal>;

    /**
     * 标识支付重新开始的流
     */
    start: Observable<any>;

    /**
     * 是否已选择了支付方式
     */
    payMethodSelected: Observable<string>;

    /**
     * @ignore
     */
    isAlive = true;

    constructor(
        private fb: FormBuilder,
        private chargeService: ChargeService
    ) {
        super();

        this.initForm();
    }

    /**
     * @ignore
     */
    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    /**
     * @ignore
     */
    initialModel() {
        this.wechatQRCode = merge(
            this.chargeService.getWechatQrCode(),
            this.form.valueChanges.pipe(
                mapTo(null)
            )
        );

        this.start = this.notifyPayStart(this.payMethod);

        this.processing = this.pay$.asObservable();

        this.payMethodSelected = this.notifyPayMethodState(this.payMethod);
    }

    /**
     * @ignore
     */
    launch() {
        this.subscription$$ = this.chargeService.launchPaymentArg(
            this.pay$.asObservable(),
        )
            .add(this.chargeService.goToAlipayPage())
            .add(this.chargeService.goToPayPal());

        this.chargeService.handlePaymentsArgsError(() => this.isAlive);

        this.chargeService.resetPaymentArgumentsRes(this.form.valueChanges.pipe(
            takeWhile(() => this.isAlive)
        ));
    }

    /**
     * @ignore
     */
    initForm() {
        this.form = this.fb.group({
            charge: [3, Validators.required],
            payMethod: null,
        });
    }

    /**
     * @ignore
     */
    get charge(): AbstractControl {
        return this.form.get('charge');
    }

    /**
     * @ignore
     */
    get payMethod(): AbstractControl {
        return this.form.get('payMethod');
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;

        this.subscription$$.unsubscribe();
    }
}
