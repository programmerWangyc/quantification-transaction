import { Component, OnDestroy, OnInit } from '@angular/core';

import { Observable, of, Subject } from 'rxjs';
import { distinctUntilChanged, map, switchMap, takeWhile, withLatestFrom } from 'rxjs/operators';

import { ExchangeService as GlobalExchangeService } from '../../providers/exchange.service';
import { PlatformService } from '../../providers/platform.service';
import { PublicService } from '../../providers/public.service';
import { ExchangeFormConfigInfo } from '../exchange-form/exchange-form.component';
import { Exchange } from '../exchange-select/exchange-select.component';
import { ExchangeType } from '../exchange.config';
import { ExchangeConstantService } from '../providers/exchange.constant.service';
import { ExchangeService } from '../providers/exchange.service';
import { isNull } from 'lodash';

@Component({
    selector: 'app-create-exchange',
    templateUrl: './create-exchange.component.html',
    styleUrls: ['./create-exchange.component.scss'],
})
export class CreateExchangeComponent implements OnDestroy, OnInit {

    /**
     * exchanges
     */
    exchanges: Observable<Exchange[]>;

    /**
     * @ignore
     */
    private excludes = ['Futures_CTP', 'Futures_LTS', 'Futures_Esunny', 'Exchange'];

    /**
     * 是否显示表单
     */
    showForm: Observable<boolean>;

    /**
     * @ignore
     */
    isAlive = true;

    /**
     * @ignore
     */
    save$: Subject<ExchangeFormConfigInfo> = new Subject();

    /**
     * 锁定的交易所类型
     */
    freezeExchangeType: Observable<number>;

    constructor(
        private publicService: PublicService,
        private globalExchangeService: GlobalExchangeService,
        private exchangeService: ExchangeService,
        private constant: ExchangeConstantService,
        private platform: PlatformService,
    ) {
    }

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
                if (type === ExchangeType.futures || type === ExchangeType.eSunny) {
                    return this.getBrokers(type);
                } else if (type === ExchangeType.currency) {
                    return exchanges;
                } else {
                    return of(this.constant.PROTOCOLS);
                }
            })
        );

        this.showForm = this.exchangeService.getExchangeConfig().pipe(
            map(config => !isNull(config.selectedExchange))
        );

        this.freezeExchangeType = this.exchangeService.getFreezeExchangeType(this.platform.getPlatformDetail().pipe(
            map(({ eid }) => eid)
        ));
    }

    /**
     * @ignore
     */
    launch() {
        this.globalExchangeService.launchExchangeList();

        this.platform.launchUpdatePlatform(this.save$.pipe(
            takeWhile(() => this.isAlive),
            withLatestFrom(
                this.exchangeService.getExchangeConfig(),
                this.globalExchangeService.getExchangeList(),
                (requestConfigInfo, config, list) => {
                    const exchange = this.exchangeService.getTargetExchange(config, list);

                    return { ...requestConfigInfo, id: -1, exchangeId: exchange.id, reserved: '' };
                }
            )
        ));

        this.platform.tipUpdatePlatformResult(() => this.isAlive);
    }

    /**
     * 获取指定类型的 broker；
     * @param type Broker type
     */
    private getBrokers(type: number): Observable<Exchange[]> {
        return this.publicService.getBrokers().pipe(
            map(list => list.filter(item => item.type === type).map(({ brokerId, name, groups }) => ({ id: brokerId, name, groups })))
        );
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;

        this.exchangeService.resetState();

        this.platform.resetState();
    }
}
