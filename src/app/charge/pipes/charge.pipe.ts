import { Pipe, PipeTransform } from '@angular/core';

import { ChargePaymentInfo, PaymentMethod } from '../charge.config';
import { ChargeConstantService } from '../providers/charge.constant.service';

@Pipe({ name: 'chargeMethod' })
export class ChargeMethodPipe implements PipeTransform {
    constructor(private constant: ChargeConstantService) { }

    transform(guid: string): string {
        const ary = guid.split(this.constant.RECHARGE_PAYMENT_FLAG);

        const paymentId = parseInt(ary[ChargePaymentInfo.paymentMethod], 10); // !FIXME: why 4 ,why 5?

        return ary.length === 5 ? PaymentMethod[paymentId] : PaymentMethod[0];
    }
}

export function getChargePrice(guid: string, flag: string): number {
    const ary = guid.split(flag);

    if (parseInt(ary[ChargePaymentInfo.days], 10) === 0) {
        return parseInt(ary[ChargePaymentInfo.amount], 10);

    } else {
        // @deprecated Never be triggered because of business logic updated.
        return parseInt(ary[ChargePaymentInfo.days], 10) * parseInt(ary[ChargePaymentInfo.amount], 10) * 3;
    }
}

@Pipe({ name: 'chargePrice' })
export class ChargePricePipe implements PipeTransform {
    constructor(public constant: ChargeConstantService) { }

    transform = (guid: string): number => {
        return getChargePrice(guid, this.constant.RECHARGE_PAYMENT_FLAG);
    }
}
