import { Injectable } from '@angular/core';

import { ConstantService } from '../../providers/constant.service';
import { PaymentMethod } from '../charge.config';

export interface PayMethod {
    name: string;
    id: number;
    redirectTo?: string;
    icon?: string;
}

export interface RentPeriod {
    days: number;
    label: string;
}

export const PAY_METHODS: PayMethod[] = [
    { name: PaymentMethod[0], id: 0, redirectTo: '', icon: 'alipay-circle' },
    { name: PaymentMethod[1], id: 1, redirectTo: '', icon: 'wechat-pay' },
    { name: PaymentMethod[2], id: 2, redirectTo: '', icon: 'paypal' },
];

export const RENT_OPTIONS: RentPeriod[] = [
    { days: 30, label: 'ONE_MONTH' },
    { days: 90, label: 'ONE_QUARTER' },
    { days: 180, label: 'HALF_YEARS' },
    { days: 360, label: 'ONE_YEAR' },
    { days: null, label: 'OTHER' },
];

@Injectable()
export class ChargeConstantService extends ConstantService {
    PAY_METHODS = PAY_METHODS;

    RENT_PAYMENT_FLAG = 'R';

    RECHARGE_PAYMENT_FLAG = 'N';

    RENT_OPTIONS = RENT_OPTIONS;

    constructor() {
        super();
    }

}
