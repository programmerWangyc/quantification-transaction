import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { isNull } from 'lodash';
import * as moment from 'moment';
import { merge, Observable, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, takeWhile } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { Strategy, StrategyListByNameStrategy } from '../../interfaces/response.interface';
import { PaymentMethod } from '../charge.config';
import { ChargeBase } from '../charge/charge.component';
import { ChargeConstantService } from '../providers/charge.constant.service';
import { ChargeService, RechargeFormModal, RentPrice } from '../providers/charge.service';

interface RentOption extends RentPrice {
    label: string;
}

interface RentFormModal extends RechargeFormModal {
    chargeShortcut: number;
    name: string;
    price: string;
    amount: number;
    deadline: string;
}

@Component({
    selector: 'app-rent',
    templateUrl: './rent.component.html',
    styleUrls: ['./rent.component.scss'],
})
export class RentComponent extends ChargeBase implements BaseComponent {

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
    pay$: Subject<RentFormModal> = new Subject();

    /**
     * 微信支付码
     */
    wechartQRCode: Observable<string>;

    /**
     * 充值的策略
     */
    strategy: Observable<Strategy | StrategyListByNameStrategy>;

    /**
     * 快速充值设置
     */
    periods: RentOption[] = [];

    /**
     * 标识支付正在进行的流
     */
    processing: Observable<RentFormModal>;

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
        private chargeService: ChargeService,
        private activatedRoute: ActivatedRoute,
        private translate: TranslateService,
        private constant: ChargeConstantService,
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

        this.setRentInfo();

        this.setPayPriceAndDeadline();

        this.setValidate();
    }

    /**
     * @ignore
     */
    initialModel() {
        this.wechartQRCode = this.chargeService.getWechartQrCode();

        this.start = this.notifyPayStart(this.payMethod);

        this.processing = this.notifyPayProcessing(this.pay$, this.payMethod);

        this.payMethodSelected = this.notifyPayMethodState(this.payMethod);

        this.strategy = this.chargeService.getChargeStrategy(this.activatedRoute.paramMap.pipe(
            map(param => +param.get('id'))
        ));
    }

    /**
     * @ignore
     */
    launch() {
        this.subscription$$ = this.chargeService.launchPaymentArg(
            this.getPaymentArgOptions(),
            this.strategy.pipe(
                map(({ id }) => -id)
            )
        )
            .add(this.chargeService.goToAlipayPage())
            .add(this.chargeService.goToPayPal())
            .add(this.chargeService.handlePaymentsArgsError());
    }

    /**
     * 生成支付参数接口的请求数据
     */
    private getPaymentArgOptions() {
        return merge(
            this.pay$,
            this.getArgsIfWechart()
        ).pipe(
            map(({ payMethod, charge, chargeShortcut }) => ({ payMethod, charge: chargeShortcut || charge }))
        );
    }

    /**
     * 设置租用信息控件的值
     */
    private setRentInfo() {
        this.strategy.pipe(
            takeWhile(() => this.isAlive)
        ).subscribe(strategy => {
            const { pricing, name } = strategy;

            const periods = this.chargeService.parsePricing(pricing);

            const { price, days } = periods[0];

            this.periods = this.constant.RENT_OPTIONS.map(item => {
                const target = periods.find(period => period.days === item.days);

                if (target) {
                    return { ...item, ...target };
                } else {
                    return { ...item, price: item.days * price, discount: 0 };
                }
            });

            this.translate.get('STRATEGY_PRICE_DESCRIPTION', { days, price })
                .subscribe(label => this.price.patchValue(label));

            this.name.patchValue(name);

            this.amount.patchValue(price);

            this.chargeShortcut.patchValue(+days);

            this.deadline.patchValue(moment().add(days, 'days').format('YYYY-MM-DD HH:mm:ss'));
        });
    }

    /**
     * 切换购买输入控件后修表单验证规则
     */
    private setValidate() {
        this.chargeShortcut.valueChanges.pipe(
            map(value => isNull(value)),
            takeWhile(() => this.isAlive)
        ).subscribe(isManual => {
            if (isManual) {
                this.charge.setValidators(Validators.required);
            } else {
                this.charge.setValidators(null);
            }

            this.charge.updateValueAndValidity();
        });

    }

    /**
     * 设置支付价格和到期时间
     */
    private setPayPriceAndDeadline(): void {
        this.form.valueChanges.pipe(
            takeWhile(() => this.isAlive),
            distinctUntilChanged((pre, cur) => pre.charge === cur.charge && pre.chargeShortcut === cur.chargeShortcut),
            map((form: RentFormModal) => form.chargeShortcut || form.charge)
        ).subscribe(period => {
            const prePrice = this.periods[0].price / this.periods[0].days;

            const total = Math.ceil(+(period * prePrice).toFixed(4));

            const { discount } = this.getRentOption();

            this.amount.patchValue(total - discount);

            this.deadline.patchValue(moment().add(period, 'days').format('YYYY-MM-DD HH:mm:ss'));
        });
    }

    /**
     * 获取计算当前价格所使用配置信息
     */
    private getRentOption(): RentOption {
        if (this.chargeShortcut.value) {
            return this.periods.find(item => item.days === this.chargeShortcut.value);

        } else {
            return this.periods.find((item, index) => {
                const next = this.periods[index + 1];

                if (next && next.days) {
                    return this.charge.value >= item.days && this.charge.value < next.days;
                } else {
                    return this.charge.value >= item.days;
                }
            });
        }
    }

    /**
     * @ignore
     */
    private initForm() {
        this.form = this.fb.group({
            name: { value: '', disabled: true },
            price: { value: '', disabled: true },
            chargeShortcut: [30, Validators.required],
            charge: 30,
            amount: { value: '', disabled: true },
            deadline: { value: '', disabled: true },
            payMethod: '',
        });
    }

    /**
     * 用户选择微信支付时，获取参数
     */
    private getArgsIfWechart(): Observable<RentFormModal> {
        return this.form.valueChanges.pipe(
            filter((form: RentFormModal) => {
                const isWechartPay = form.payMethod === PaymentMethod.WECHAT;

                const isRentPeriodValid = !!this.chargeShortcut.value || this.charge.valid;

                return isWechartPay && isRentPeriodValid;
            }),
            distinctUntilChanged((pre, cur) => pre.charge === cur.charge && pre.chargeShortcut === cur.chargeShortcut)
        );
    }

    /**
     * 金额的格式化函数
     */
    amountFormatter = (value: number): string => {
        const language = this.translate.getDefaultLang();

        const currencyCode = language === 'zh' ? 'CNY' : 'AMD';

        const pipe = new CurrencyPipe(language);

        return pipe.transform(value, currencyCode, 'symbol');
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
    get chargeShortcut(): AbstractControl {
        return this.form.get('chargeShortcut');
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
    get price(): AbstractControl {
        return this.form.get('price');
    }

    /**
     * @ignore
     */
    get name(): AbstractControl {
        return this.form.get('name');
    }

    /**
     * @ignore
     */
    get deadline(): AbstractControl {
        return this.form.get('deadline');
    }

    /**
     * @ignore
     */
    get amount(): AbstractControl {
        return this.form.get('amount');
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;

        this.subscription$$.unsubscribe();
    }
}
