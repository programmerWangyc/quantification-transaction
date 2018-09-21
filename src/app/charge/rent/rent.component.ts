import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { isNull } from 'lodash';
import * as moment from 'moment';
import { merge, Observable, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, map, mapTo, takeWhile } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { Strategy, StrategyListByNameStrategy } from '../../interfaces/response.interface';
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

    subscription$$: Subscription;

    form: FormGroup;

    pay$: Subject<RentFormModal> = new Subject();

    wechatQRCode: Observable<string>;

    strategy: Observable<Strategy | StrategyListByNameStrategy>;

    periods: RentOption[] = [];

    processing: Observable<RentFormModal>;

    start: Observable<any>;

    payMethodSelected: Observable<string>;

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

    ngOnInit() {
        this.initialModel();

        this.launch();

        this.setRentInfo();

        this.setPayPriceAndDeadline();

        this.setValidate();
    }

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

        this.strategy = this.chargeService.getChargeStrategy(this.activatedRoute.paramMap.pipe(
            map(param => +param.get('id'))
        ));
    }

    launch() {
        this.subscription$$ = this.chargeService.launchPaymentArg(
            this.getPaymentArgOptions(),
            this.strategy.pipe(
                map(({ id }) => -id)
            )
        )
            .add(this.chargeService.goToAlipayPage())
            .add(this.chargeService.goToPayPal());

        this.chargeService.handlePaymentsArgsError(() => this.isAlive);

        this.chargeService.resetPaymentArgumentsRes(this.form.valueChanges.pipe(
            takeWhile(() => this.isAlive)
        ));
    }

    private getPaymentArgOptions() {
        return this.pay$.pipe(
            map(({ payMethod, charge, chargeShortcut }) => ({ payMethod, charge: chargeShortcut || charge }))
        );
    }

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

    private initForm() {
        this.form = this.fb.group({
            name: { value: '', disabled: true },
            price: { value: '', disabled: true },
            chargeShortcut: 30,
            charge: 30,
            amount: { value: '', disabled: true },
            deadline: { value: '', disabled: true },
            payMethod: '',
        });
    }

    amountFormatter = (value: number): string => {
        const language = this.translate.getDefaultLang();

        const currencyCode = language === 'zh' ? 'CNY' : 'AMD';

        const pipe = new CurrencyPipe(language);

        return pipe.transform(value, currencyCode, 'symbol');
    }

    get charge(): AbstractControl {
        return this.form.get('charge');
    }

    get chargeShortcut(): AbstractControl {
        return this.form.get('chargeShortcut');
    }

    get payMethod(): AbstractControl {
        return this.form.get('payMethod');
    }

    get price(): AbstractControl {
        return this.form.get('price');
    }

    get name(): AbstractControl {
        return this.form.get('name');
    }

    get deadline(): AbstractControl {
        return this.form.get('deadline');
    }

    get amount(): AbstractControl {
        return this.form.get('amount');
    }

    ngOnDestroy() {
        this.isAlive = false;

        this.subscription$$.unsubscribe();
    }
}
