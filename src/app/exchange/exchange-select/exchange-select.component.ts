import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { isNumber } from 'lodash';
import { merge, Observable } from 'rxjs';
import { filter, map, mergeMap, startWith, takeWhile } from 'rxjs/operators';

import { Path } from '../../app.config';
import { BrokerGroup, BrokerNet } from '../../interfaces/response.interface';
import { PlatformService } from '../../providers/platform.service';
import { ExchangeType } from '../exchange.config';
import { ExchangeService } from '../providers/exchange.service';

export interface Exchange {
    id: number | string;
    name: string;
    website?: string;
    logo?: string;
    groups?: BrokerGroup[];
}

@Component({
    selector: 'app-exchange-select',
    templateUrl: './exchange-select.component.html',
    styleUrls: ['./exchange-select.component.scss'],
})
export class ExchangeSelectComponent implements OnInit, OnDestroy {

    /**
     * 交易所源数据
     */
    @Input() exchanges: Observable<Exchange[]>;

    /**
     * 选中的交易所类型
     */
    @Input() set selectedExchangeType(input: number) {
        if (isNumber(input)) {
            this.exchangeType.patchValue(input);

            this.disableTypeChange = true;

            this.patchInitialValue(input);
        }
    }

    /**
     * 是否禁用易所类型选择
     */
    disableTypeChange = false;

    /**
     * @ignore
     */
    obviouslyExchanges: Exchange[] = [];

    /**
     * @ignore
     */
    moreExchanges: Exchange[] = [];

    /**
     * 锁定的交易所名称
     */
    frozenExchange: string = '';

    /**
     * 用户选择的交易所；
     */
    @Output() select: EventEmitter<any> = new EventEmitter();

    /**
     * 交易所类型
     */
    exchangeType: FormControl = new FormControl(0);

    /**
     * 用户选中的交易所名称
     */
    exchange: FormControl = new FormControl();

    /**
     * 搜索的交易所名称的关键字
     */
    search: FormControl = new FormControl();

    /**
     * 服务器区域
     */
    region: FormControl = new FormControl();

    /**
     * 通信运营商
     */
    provider: FormControl = new FormControl();

    /**
     * 行情服务器IP
     */
    quotaIP: FormControl = new FormControl();

    /**
     * 行情服务器IP
     */
    tradeIP: FormControl = new FormControl();

    /**
     * 服务器的区域信息
     */
    regions: BrokerGroup[] = [];

    /**
     * 服务器使用的网络
     */
    nets: BrokerNet[] = [];

    /**
     * 行情服务器可用IP
     */
    quotaIPs: string[] = [];

    /**
     * 交易服务器可用IP
     */
    tradeIPs: string[] = [];

    /**
     * @ignore
     */
    private isAlive = true;

    /**
     * 台面展示的交易所最大数量
     */
    maxCount = 30;

    /**
     * @ignore
     */
    specialRatio = 'more';

    constructor(
        private exchangeService: ExchangeService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private platform: PlatformService,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
        const exchangeValue = merge(
            this.exchange.valueChanges.pipe(
                filter(value => value !== this.specialRatio)
            ),
            this.search.valueChanges
        ).pipe(
            takeWhile(() => this.isAlive)
        );

        this.syncData(exchangeValue);

        this.monitorFormControl(exchangeValue);

        this.updateData();
    }

    /**
     * 同步数据到store中
     */
    private syncData(exchange: Observable<number>): void {
        this.exchangeService.updateExchangeType(this.exchangeType.valueChanges.pipe(
            takeWhile(() => this.isAlive),
            startWith(0)
        ));

        this.exchangeService.updateExchange(exchange);

        this.exchangeService.updateExchangeRegion(this.region.valueChanges.pipe(
            takeWhile(() => this.isAlive)
        ));

        this.exchangeService.updateExchangeProvider(this.provider.valueChanges.pipe(
            takeWhile(() => this.isAlive)
        ));

        this.exchangeService.updateExchangeQuotaServer(this.quotaIP.valueChanges.pipe(
            takeWhile(() => this.isAlive)
        ));

        this.exchangeService.updateExchangeTradeServer(this.tradeIP.valueChanges.pipe(
            takeWhile(() => this.isAlive)
        ));
    }

    /**
     * 监控数据变化
     */
    private monitorFormControl(exchangeObs: Observable<number>) {

        this.exchangeType.valueChanges.pipe(
            takeWhile(() => this.isAlive),
        ).subscribe(() => {
            this.exchange.reset();

            this.search.reset();
        });

        exchangeObs.pipe(
            mergeMap(exchange => this.exchanges.pipe(
                map(exchanges => exchanges.find(item => item.id === exchange))
            )),
            filter(exist => !!exist),
            map((exchange: Exchange) => exchange.groups)
        ).subscribe(groups => {
            this.regions = groups || [];

            this.region.patchValue(0);
        });

        this.exchange.valueChanges.pipe(
            takeWhile(() => this.isAlive),
            filter(value => value === this.specialRatio)
        ).subscribe(() => {
            this.search.reset();

            this.region.reset();

            this.provider.reset();

            this.quotaIP.reset();

            this.tradeIP.reset();
        });

        this.region.valueChanges.pipe(
            takeWhile(() => this.isAlive),
            map(idx => this.regions[idx]),
            filter(exist => !!exist),
            map(region => region.nets)
        ).subscribe(nets => {
            this.nets = nets;

            this.provider.patchValue(0);
        });

        this.provider.valueChanges.pipe(
            takeWhile(() => this.isAlive),
            map(idx => this.nets[idx]),
            filter(exist => !!exist)
        ).subscribe(net => {
            const { quote, trade } = net;

            this.quotaIPs = quote;

            this.tradeIPs = trade;

            this.quotaIP.patchValue(this.quotaIPs[0]);

            this.tradeIP.patchValue(this.tradeIPs[0]);
        });
    }

    /**
     * @ignore
     */
    private updateData() {
        this.exchanges.pipe(
            takeWhile(() => this.isAlive)
        ).subscribe(exchanges => {
            if (exchanges.length > this.maxCount) {
                this.obviouslyExchanges = exchanges.slice(0, this.maxCount);

                this.moreExchanges = exchanges.slice(this.maxCount);
            } else {
                this.obviouslyExchanges = exchanges;

                this.moreExchanges = [];
            }
        });
    }

    /**
     * 当交易所类型选择被禁用时，修改相应控件的初始值。
     */
    private patchInitialValue(type: number): void {
        if (type === ExchangeType.currency) {
            this.setSelectedCurrencyExchange();
        } else if (type === ExchangeType.futures || type === ExchangeType.eSunny) {
            this.setSelectedFuturesExchange(type);
        } else {
            this.exchange.patchValue(0); // !随便设的。。。返回的 platformDetail 信息上无法确定到底是哪一种类型的协议。
        }
    }

    /**
     * 获取数字货币交易所信息
     */
    private setSelectedCurrencyExchange(): void {
        this.platform.getPlatformDetail().pipe(
            takeWhile(() => this.isAlive)
        ).subscribe(platform => {
            this.frozenExchange = platform.name;
            this.exchange.patchValue(platform.eid);
        });
    }

    /**
     * 获取期货的交易所信息
     */
    private setSelectedFuturesExchange(type: number): void {
        this.platform.getPreviousPlatformInfo().pipe(
            takeWhile(() => this.isAlive)
        ).subscribe(info => {
            if (info.brokerIndex >= this.maxCount && type === ExchangeType.futures) {
                this.exchange.patchValue(this.specialRatio);
                this.search.patchValue(info.brokerId);
            } else {
                this.exchange.patchValue(info.brokerId);
            }

            this.region.patchValue(info.regionIndex);

            this.provider.patchValue(info.providerIndex);

            this.quotaIP.patchValue(info.quotaServer);

            this.tradeIP.patchValue(info.tradeServer);
        });
    }

    /**
     * @ignore
     */
    goTo() {
        this.router.navigate([Path.doc], { relativeTo: this.activatedRoute.parent.parent });
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;
    }
}
