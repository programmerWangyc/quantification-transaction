import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { merge, Observable } from 'rxjs';
import { filter, map, startWith, takeWhile } from 'rxjs/operators';

import { BrokerGroup, BrokerNet } from '../../interfaces/response.interface';
import { ExchangeService } from '../providers/exchange.service';
import { Path } from '../../app.config';

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
    @Input() set exchanges(input: Exchange[]) {
        if (!Array.isArray(input)) return;

        this._exchanges = input;

        this.updateData();
    }

    /**
     * @ignore
     */
    get exchanges(): Exchange[] {
        return this._exchanges;
    }

    /**
     * @ignore
     */
    obviouslyExchanges: Exchange[] = [];

    /**
     * @ignore
     */
    moreExchanges: Exchange[] = [];

    /**
     * @ignore
     */
    private _exchanges: Exchange[] = [];

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
     * @ignore
     */
    private isAlive = true;

    /**
     * 台面展示的交易所最大数量
     */
    maxCount = 30;

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

    constructor(
        private exchangeService: ExchangeService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {

        const exchangeValue = merge(
            this.exchange.valueChanges.pipe(
                filter(value => value !== 'more')
            ),
            this.search.valueChanges
        ).pipe(
            takeWhile(() => this.isAlive)
        );

        this.syncData(exchangeValue);

        this.monitorFormControl(exchangeValue);
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
            map(exchange => this.exchanges.find(item => item.id === exchange)),
            filter(exist => !!exist),
            map((exchange: Exchange) => exchange.groups)
        ).subscribe(groups => {
            this.regions = groups || [];

            this.region.patchValue(0);
        });

        this.exchange.valueChanges.pipe(
            takeWhile(() => this.isAlive),
            filter(value => value === 'more')
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
        if (this.exchanges.length > 30) {
            this.obviouslyExchanges = this.exchanges.slice(0, this.maxCount);

            this.moreExchanges = this.exchanges.slice(this.maxCount);
        } else {
            this.obviouslyExchanges = this.exchanges;
        }
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
