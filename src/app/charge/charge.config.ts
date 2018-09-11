
export enum PaymentMethod {
    ALIPAY,
    WECHAT,
    PAY_PAL,
}

// !FIXME: unused;
// export enum RentPaymentInfo {
//     timestamp,
//     strategyId,
//     rentPeriod,
//     uid,
//     paymentMethod,
// }

export enum ChargePaymentInfo {
    timestamp,
    days,
    amount,
    uid,
    paymentMethod,
}
