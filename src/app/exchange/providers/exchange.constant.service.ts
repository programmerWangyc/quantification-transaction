import { Injectable } from '@angular/core';

import { Platform } from '../../interfaces/response.interface';
import { ConstantService } from '../../providers/constant.service';
import { Exchange } from '../exchange-select/exchange-select.component';
import { ExchangeType } from '../exchange.config';

@Injectable()
export class ExchangeConstantService extends ConstantService {
    readonly EXCHANGES: Platform[] = [{ eid: 'BotVS', id: -1, label: 'BotVS', name: 'BotVS', stocks: ['BTC_USD'] }];

    readonly PROTOCOLS: Exchange[] = [{ id: 0, name: 'REST' }, { id: 1, name: 'FIX' }];

    constructor() {
        super();
    }

    eidToExchangeType(eid: string): number {
        if (eid === this.FUTURES_CTP) {
            return ExchangeType.futures;
        } else if (eid === this.FUTURES_ESUNNY) {
            return ExchangeType.eSunny;
        } else if (eid === this.COMMON_PROTOCOL_EXCHANGE) {
            return ExchangeType.protocol;
        } else {
            return ExchangeType.currency;
        }
    }
}
