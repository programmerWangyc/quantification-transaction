
import { Injectable } from '@angular/core';
import { ConstantService } from '../../providers/constant.service';
import { Platform } from '../../interfaces/response.interface';
import { Exchange } from '../exchange-select/exchange-select.component';

@Injectable()
export class ExchangeConstantService extends ConstantService {
    EXCHANGES: Platform[] = [{ eid: 'BotVS', id: -1, label: 'BotVS', name: 'BotVS', stocks: ['BTC_USD'] }];

    PROTOCOLS: Exchange[] = [{ id: 0, name: 'REST' }, { id: 1, name: 'FIX' }];

    constructor() {
        super();
    }
}
