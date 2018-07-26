
import { Injectable } from '@angular/core';
import { ConstantService } from '../../providers/constant.service';
import { Platform } from '../../interfaces/response.interface';

@Injectable()
export class ExchangeConstantService extends ConstantService {
    EXCHANGES: Platform[] = [{ eid: 'BotVS', id: -1, label: 'BotVS', name: 'BotVS', stocks: ['BTC_USD'] }];

    constructor() {
        super();
    }
}
