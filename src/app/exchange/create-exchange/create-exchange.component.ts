import { Component, OnDestroy, OnInit } from '@angular/core';

import { Observable, of } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { SettingTypes } from '../../interfaces/request.interface';
import { Broker } from '../../interfaces/response.interface';
import { ExchangeService as GlobalExchangeService } from '../../providers/exchange.service';
import { PublicService } from '../../providers/public.service';
import { Exchange } from '../exchange-select/exchange-select.component';
import { ExchangeType } from '../exchange.config';
import { ExchangeConstantService } from '../providers/exchange.constant.service';
import { ExchangeService } from '../providers/exchange.service';

@Component({
    selector: 'app-create-exchange',
    templateUrl: './create-exchange.component.html',
    styleUrls: ['./create-exchange.component.scss'],
})
export class CreateExchangeComponent implements OnInit, OnDestroy {

    /**
     * exchanges
     */
    exchanges: Observable<Exchange[]>;

    /**
     * @ignore
     */
    private excludes = ['Futures_CTP', 'Futures_LTS', 'Futures_Esunny', 'Exchange'];

    /**
     * @ignore
     */
    isAlive = true;

    constructor(
        private publicService: PublicService,
        private globalExchangeService: GlobalExchangeService,
        private exchangeService: ExchangeService,
        private constant: ExchangeConstantService,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    /**
     * @ignore
     */
    initialModel() {

        const exchanges = this.globalExchangeService.getExchangeList(this.excludes);

        this.exchanges = this.exchangeService.getExchangeConfig().pipe(
            map(config => config.selectedTypeId),
            distinctUntilChanged(),
            switchMap(type => {
                if (type === ExchangeType.futures || type === ExchangeType.yiSheng) {
                    return this.getBrokers(type);
                } else if (type === ExchangeType.currency) {
                    return exchanges;
                } else {
                    return of(this.constant.PROTOCOLS);
                }
            })
        );
    }

    /**
     * 获取指定类型的 broker；
     * @param type Broker type
     */
    private getBrokers(type: number): Observable<Exchange[]> {
        return this.publicService.getSetting(SettingTypes.brokers).pipe(
            map(source => JSON.parse(source) as Broker[]),
            map(list => list.filter(item => item.type === type).map(({ brokerId, name, groups }) => ({ id: brokerId, name, groups })))
        );
    }

    /**
     * @ignore
     */
    launch() {
        this.globalExchangeService.launchExchangeList();
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;
    }
}
