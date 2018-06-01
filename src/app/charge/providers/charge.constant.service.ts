import { Injectable } from '@angular/core';

import { ConstantService } from '../../providers/constant.service';
import { PaymentMethod } from '../charge.config';

export interface PayMethod {
    name: string;
    id: number;
    redirectTo?: string;
}

export const PAY_METHODS: PayMethod[] = [
    { name: PaymentMethod[0], id: 0, redirectTo: '' },
    { name: PaymentMethod[1], id: 1, redirectTo: '' },
    { name: PaymentMethod[2], id: 2, redirectTo: '' },
];

@Injectable()
export class ChargeConstantService extends ConstantService {
    PAY_METHODS = PAY_METHODS;

    RENT_PAYMENT_FLAG = 'R';

    RECHARGE_PAYMENT_FLAG = 'N';

    constructor() {
        super();
    }

}
