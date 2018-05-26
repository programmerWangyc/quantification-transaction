import { Pipe, PipeTransform } from '@angular/core';

import { ChargePaymentInfo, PaymentMethod } from '../../interfaces/constant.interface';
import { RECHARGE_PAYMENT_FLAG } from '../../providers/constant.service';

@Pipe({
    name: 'chargeMethod'
})
export class ChargeMethodPipe implements PipeTransform {
    transform(guid: string): string {
        const ary = guid.split(RECHARGE_PAYMENT_FLAG);

        const length = ary.length;

        const paymentId = parseInt(ary[ChargePaymentInfo.paymentMethod]); // FIXME: why 4 ,why 5?

        return ary.length === 5 ? PaymentMethod[paymentId] : PaymentMethod[0];
    }
}

/**
 * @deprecated
 */
export function getChargePrice(guid: string): number {
    const ary = guid.split(RECHARGE_PAYMENT_FLAG);

    if (parseInt(ary[ChargePaymentInfo.days]) === 0) {
        return parseInt(ary[ChargePaymentInfo.amount]);

    } else {
        // @deprecated Never be triggered because of business logic updated.
        return parseInt(ary[ChargePaymentInfo.days]) * parseInt(ary[ChargePaymentInfo.amount]) * 3;
    }
}

@Pipe({
    name: 'chargePrice'
})
export class ChargePricePipe implements PipeTransform {
    transform = getChargePrice;
}
